import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { saveFileRecord, getFileRecord, deleteFileRecord, getAdminStats, getSetting, setSetting } from './server/database.js';
import { setupBot, getTelegramFileInfo, streamTelegramFile, uploadFileToTelegram, telegramClient, binChannel } from './server/bot.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isVercel = process.env.VERCEL === '1';
const UPLOADS_DIR = isVercel 
  ? path.join('/tmp', 'uploads') 
  : path.join(process.cwd(), 'uploads');
const adminTokens = new Set<string>();

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    (req as any).fileId = id; // Store ID in request object for later use
    cb(null, id);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 2000 // 2GB limit
  }
});

function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Routes
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      let fileId = (req as any).fileId;
      let isTelegram = false;

      // Upload to Telegram if configured
      if (telegramClient && binChannel) {
        const messageId = await uploadFileToTelegram(req.file.path, req.file.originalname);
        if (messageId) {
          fileId = messageId.toString();
          isTelegram = true;
        }
      }

      const record = {
        id: fileId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadDate: Date.now()
      };

      saveFileRecord(record);
      
      // Clean up local file only if uploaded to Telegram
      if (isTelegram && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.json({ success: true, file: record });
    } catch (error) {
      console.error('Error in upload:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to process file' });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = getSetting('admin_password', 'admin123');
    
    if (password === adminPassword) {
      const token = uuidv4();
      adminTokens.add(token);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    try {
      const stats = getAdminStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
    res.json({
      telegram_api_id: getSetting('telegram_api_id'),
      telegram_api_hash: getSetting('telegram_api_hash'),
      telegram_bot_token: getSetting('telegram_bot_token'),
      bin_channel_id: getSetting('bin_channel_id'),
      admin_password: getSetting('admin_password')
    });
  });

  app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
    const { telegram_api_id, telegram_api_hash, telegram_bot_token, bin_channel_id, admin_password } = req.body;
    
    try {
      if (telegram_api_id !== undefined) setSetting('telegram_api_id', telegram_api_id);
      if (telegram_api_hash !== undefined) setSetting('telegram_api_hash', telegram_api_hash);
      if (telegram_bot_token !== undefined) setSetting('telegram_bot_token', telegram_bot_token);
      if (bin_channel_id !== undefined) setSetting('bin_channel_id', bin_channel_id);
      if (admin_password !== undefined) setSetting('admin_password', admin_password);

      // Restart bot with new settings
      const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
      await setupBot(APP_URL);

      res.json({ success: true });
    } catch (err) {
      console.error('Error saving settings:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  app.delete('/api/admin/files/:id', authenticateAdmin, (req, res) => {
    const id = req.params.id;
    try {
      const record = getFileRecord(id);
      if (record) {
        deleteFileRecord(id);
        const filePath = path.join(UPLOADS_DIR, id);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  app.get('/api/files/:id', async (req, res) => {
    const id = req.params.id;
    if (/^\d+$/.test(id)) {
      // Telegram file
      const info = await getTelegramFileInfo(parseInt(id));
      if (!info) return res.status(404).json({ error: 'File not found' });
      return res.json(info);
    }

    const record = getFileRecord(id);
    if (!record) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(record);
  });

  app.get('/api/download/:id', async (req, res) => {
    const id = req.params.id;
    
    if (/^\d+$/.test(id)) {
      const info = await getTelegramFileInfo(parseInt(id));
      if (!info) return res.status(404).json({ error: 'File not found' });
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(info.originalName)}"`);
      res.setHeader('Content-Type', info.mimeType);
      res.setHeader('Content-Length', info.size);
      
      await streamTelegramFile(parseInt(id), req, res, 0, info.size - 1);
      return;
    }

    const record = getFileRecord(id);
    if (!record) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(UPLOADS_DIR, record.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File content not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(record.originalName)}"`);
    res.setHeader('Content-Type', record.mimeType);
    res.setHeader('Content-Length', record.size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  app.get('/api/stream/:id', async (req, res) => {
    const id = req.params.id;

    if (/^\d+$/.test(id)) {
      const info = await getTelegramFileInfo(parseInt(id));
      if (!info) return res.status(404).json({ error: 'File not found' });

      const fileSize = info.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': info.mimeType,
        };
        res.writeHead(206, head);
        await streamTelegramFile(parseInt(id), req, res, start, end);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': info.mimeType,
        };
        res.writeHead(200, head);
        await streamTelegramFile(parseInt(id), req, res, 0, fileSize - 1);
      }
      return;
    }

    const record = getFileRecord(id);
    if (!record) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(UPLOADS_DIR, record.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File content not found on disk' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': record.mimeType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': record.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const viteModule = 'vite';
    const { createServer: createViteServer } = await import(viteModule);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
    setupBot(APP_URL);
  });
}

startServer();
