import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    originalName TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploadDate INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: number;
}

export function getSetting(key: string, defaultValue: string = ''): string {
  const stmt = db.prepare(`SELECT value FROM settings WHERE key = ?`);
  const result = stmt.get(key) as { value: string } | undefined;
  return result ? result.value : defaultValue;
}

export function setSetting(key: string, value: string) {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET value = @value
  `);
  stmt.run({ key, value });
}

// Initialize default settings if they don't exist
if (!getSetting('admin_password')) {
  setSetting('admin_password', 'admin123');
}
if (!getSetting('telegram_api_id') && process.env.TELEGRAM_API_ID) {
  setSetting('telegram_api_id', process.env.TELEGRAM_API_ID);
}
if (!getSetting('telegram_api_hash') && process.env.TELEGRAM_API_HASH) {
  setSetting('telegram_api_hash', process.env.TELEGRAM_API_HASH);
}
if (!getSetting('telegram_bot_token') && process.env.TELEGRAM_BOT_TOKEN) {
  setSetting('telegram_bot_token', process.env.TELEGRAM_BOT_TOKEN);
}
if (!getSetting('bin_channel_id') && process.env.BIN_CHANNEL_ID) {
  setSetting('bin_channel_id', process.env.BIN_CHANNEL_ID);
}

export function saveFileRecord(record: FileRecord) {
  const stmt = db.prepare(`
    INSERT INTO files (id, originalName, mimeType, size, uploadDate)
    VALUES (@id, @originalName, @mimeType, @size, @uploadDate)
  `);
  stmt.run(record);
}

export function getFileRecord(id: string): FileRecord | undefined {
  const stmt = db.prepare(`SELECT * FROM files WHERE id = ?`);
  return stmt.get(id) as FileRecord | undefined;
}

export function deleteFileRecord(id: string) {
  const stmt = db.prepare(`DELETE FROM files WHERE id = ?`);
  stmt.run(id);
}

export function getAdminStats() {
  const totalFilesStmt = db.prepare(`SELECT COUNT(*) as count FROM files`);
  const totalSizeStmt = db.prepare(`SELECT SUM(size) as totalSize FROM files`);
  const recentFilesStmt = db.prepare(`SELECT * FROM files ORDER BY uploadDate DESC LIMIT 10`);
  
  const totalFiles = (totalFilesStmt.get() as any).count;
  const totalSize = (totalSizeStmt.get() as any).totalSize || 0;
  const recentFiles = recentFilesStmt.all() as FileRecord[];

  return {
    totalFiles,
    totalSize,
    recentFiles
  };
}
