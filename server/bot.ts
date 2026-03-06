import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import { Button } from 'telegram/tl/custom/button.js';
import bigInt from 'big-integer';
import { getSetting } from './database.js';

export let telegramClient: TelegramClient | null = null;
export let binChannel: string = '';

export async function getTelegramFileInfo(messageId: number) {
  if (!telegramClient || !binChannel) return null;
  try {
    const messages = await telegramClient.getMessages(binChannel, { ids: [messageId] });
    const message = messages[0];
    if (!message || !message.media) return null;

    let fileName = 'file';
    let fileSize = 0;
    let mimeType = 'application/octet-stream';

    if (message.document) {
       const attributes = message.document.attributes;
       const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
       if (filenameAttr) fileName = (filenameAttr as any).fileName;
       fileSize = message.document.size.toJSNumber();
       mimeType = message.document.mimeType;
    } else if (message.video) {
       const attributes = message.video.attributes;
       const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
       if (filenameAttr) fileName = (filenameAttr as any).fileName;
       else fileName = 'video.mp4';
       fileSize = message.video.size.toJSNumber();
       mimeType = message.video.mimeType;
    } else if (message.audio) {
       const attributes = message.audio.attributes;
       const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
       if (filenameAttr) fileName = (filenameAttr as any).fileName;
       else fileName = 'audio.mp3';
       fileSize = message.audio.size.toJSNumber();
       mimeType = message.audio.mimeType;
    }

    return {
      id: messageId.toString(),
      originalName: fileName,
      mimeType: mimeType,
      size: fileSize,
      uploadDate: message.date * 1000,
      media: message.media
    };
  } catch (err) {
    console.error('Error getting Telegram file info:', err);
    return null;
  }
}

export async function streamTelegramFile(messageId: number, req: any, res: any, start: number, end: number) {
  if (!telegramClient || !binChannel) {
    res.status(500).end();
    return;
  }
  try {
    const messages = await telegramClient.getMessages(binChannel, { ids: [messageId] });
    const message = messages[0];
    if (!message || !message.media) {
      res.status(404).end();
      return;
    }

    const chunkSize = end - start + 1;
    
    // GramJS iterDownload
    const stream = telegramClient.iterDownload({
      file: message.media,
      offset: bigInt(start),
      limit: chunkSize,
      requestSize: 1024 * 1024 // 1MB chunks
    });

    let isDisconnected = false;
    req.on('close', () => {
      isDisconnected = true;
    });

    for await (const chunk of stream) {
      if (isDisconnected) break;
      
      if (!res.write(chunk)) {
        // Handle backpressure
        await new Promise(resolve => res.once('drain', resolve));
      }
    }
    
    if (!isDisconnected) {
      res.end();
    }
  } catch (err) {
    console.error('Error streaming from Telegram:', err);
    if (!res.headersSent) {
      res.status(500).end();
    } else {
      res.end();
    }
  }
}

export async function uploadFileToTelegram(filePath: string, fileName: string): Promise<number | null> {
  if (!telegramClient || !binChannel) return null;
  try {
    const message = await telegramClient.sendFile(binChannel, {
      file: filePath,
      attributes: [
        new Api.DocumentAttributeFilename({ fileName })
      ]
    });
    return message.id;
  } catch (err) {
    console.error('Error uploading to Telegram:', err);
    return null;
  }
}

export async function setupBot(appUrl: string) {
  const apiIdStr = getSetting('telegram_api_id');
  const apiId = apiIdStr ? parseInt(apiIdStr) : 0;
  const apiHash = getSetting('telegram_api_hash');
  const botToken = getSetting('telegram_bot_token');
  binChannel = getSetting('bin_channel_id');

  if (telegramClient) {
    try {
      await telegramClient.disconnect();
      telegramClient = null;
    } catch (e) {
      console.error('Error disconnecting existing client:', e);
    }
  }

  if (!apiId || !apiHash || !botToken || !binChannel) {
    console.log('Telegram credentials missing or incomplete. Bot disabled.');
    return;
  }

  const client = new TelegramClient(new StringSession(getSetting('telegram_session', '')), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    botAuthToken: botToken,
  });

  telegramClient = client;
  console.log('Telegram bot started with GramJS!');

  client.addEventHandler(async (event) => {
    const message = event.message;
    
    if (message.isPrivate && message.text === '/start') {
        await client.sendMessage(message.chatId, {
            message: '🇬🇧 Welcome to File Stream Bot! Send me any file (up to 2GB) and I will generate a direct stream/download link for you.\n\n🇸🇦 أهلاً بك في بوت بث الملفات! أرسل لي أي ملف (حتى 2 جيجابايت) وسأقوم بإنشاء رابط مباشر للبث والتحميل.'
        });
        return;
    }

    if (message.isPrivate && message.media) {
      try {
        const processingMsg = await client.sendMessage(message.chatId, {
            message: '⏳ Processing your file... / جاري معالجة الملف...',
            replyTo: message.id
        });

        // Forward to bin channel
        const forwarded = await client.sendMessage(binChannel, {
          message: message,
        });

        const messageId = forwarded.id;
        
        let fileName = 'file';
        let fileSize = 0;
        
        if (message.document) {
           const attributes = message.document.attributes;
           const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
           if (filenameAttr) fileName = (filenameAttr as any).fileName;
           fileSize = message.document.size.toJSNumber();
        } else if (message.video) {
           const attributes = message.video.attributes;
           const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
           if (filenameAttr) fileName = (filenameAttr as any).fileName;
           else fileName = 'video.mp4';
           fileSize = message.video.size.toJSNumber();
        } else if (message.audio) {
           const attributes = message.audio.attributes;
           const filenameAttr = attributes.find(a => a.className === 'DocumentAttributeFilename');
           if (filenameAttr) fileName = (filenameAttr as any).fileName;
           else fileName = 'audio.mp3';
           fileSize = message.audio.size.toJSNumber();
        }

        const streamLink = `${appUrl}/file/${messageId}`;
        const downloadLink = `${appUrl}/api/download/${messageId}`;

        const msgText = `
✅ <b>Your Link Generated! / تم إنشاء الرابط!</b>

<b>📂 Name / الاسم :</b> <i>${fileName}</i>
<b>📦 Size / الحجم :</b> <i>${(fileSize / (1024 * 1024)).toFixed(2)} MB</i>

<b>🖥 WATCH / مشاهدة :</b> <a href="${streamLink}">${streamLink}</a>
<b>📥 Download / تحميل :</b> <a href="${downloadLink}">${downloadLink}</a>
`;

        await client.editMessage(message.chatId, {
          message: processingMsg.id,
          text: msgText,
          parseMode: 'html',
          buttons: [
            [Button.url('🖥 STREAM / مشاهدة', streamLink), Button.url('📥 Download / تحميل', downloadLink)]
          ]
        });
      } catch (err) {
        console.error(err);
        await client.sendMessage(message.chatId, {
            message: '❌ An error occurred while processing your file. / حدث خطأ أثناء معالجة الملف.'
        });
      }
    }
  }, new NewMessage({}));
}
