import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Conversation, type IConversation } from '../models/Conversation.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Case } from '../models/Case.js';
import { AppError } from '../utils/AppError.js';
import { chatWithAI } from '../services/aiService.js';
import { uploadImageBuffer } from '../services/cloudinaryService.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { UPLOAD_CHAT_DIR } from '../config/upload.js';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function getOrCreateConversation(req: Request, res: Response): Promise<void> {
  const sessionId = (req.body?.sessionId ?? req.query?.sessionId) as string | undefined;
  const user = req.user;

  if (!sessionId && !user) {
    throw new AppError('Укажите sessionId или войдите в аккаунт', 400);
  }

  let conv = await Conversation.findOne(
    user ? { userId: user._id } : { sessionId }
  ).sort({ updatedAt: -1 });

  if (!conv) {
    conv = await Conversation.create({
      sessionId: user ? undefined : sessionId,
      userId: user?._id,
    });
  }

  const convDoc = conv as IConversation;
  const messages = await ChatMessage.find({ conversationId: convDoc._id })
    .sort({ createdAt: 1 })
    .lean();

  res.json({
    conversationId: convDoc._id.toString(),
    messages: messages.map((m) => ({
      _id: m._id.toString(),
      role: m.role,
      content: m.content,
      imageUrls: m.imageUrls ?? [],
      createdAt: m.createdAt,
    })),
  });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { conversationId, content, imageUrls, caseId } = req.body as {
    conversationId?: string;
    content?: string;
    imageUrls?: string[];
    caseId?: string;
  };
  const sessionId = req.body?.sessionId as string | undefined;
  const user = req.user;

  if (!content?.trim() && (!imageUrls || imageUrls.length === 0)) {
    throw new AppError('Введите сообщение', 400);
  }

  let conv: Awaited<ReturnType<typeof Conversation.findById>>;
  if (conversationId) {
    conv = await Conversation.findById(conversationId);
  } else {
    conv = await Conversation.findOne(
      user ? { userId: user._id } : { sessionId }
    ).sort({ updatedAt: -1 });
    if (!conv) {
      conv = await Conversation.create({
        sessionId: user ? undefined : sessionId,
        userId: user?._id,
      });
    }
  }

  if (!conv) throw new AppError('Диалог не найден', 404);

  const text = (content ?? '').trim();
  const images = Array.isArray(imageUrls) ? imageUrls : [];

  const convDoc = conv as IConversation;
  const userMsg = await ChatMessage.create({
    conversationId: convDoc._id,
    role: 'user',
    content: text || '(изображение)',
    imageUrls: images,
  });

  const history = await ChatMessage.find({ conversationId: convDoc._id })
    .sort({ createdAt: 1 })
    .lean();
  const aiMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.role === 'user' ? (m.content + (m.imageUrls?.length ? ' [Изображения приложены]' : '')) : m.content,
  }));

  let systemContext: string | undefined;
  if (caseId) {
    const caseDoc = await Case.findById(caseId).select('title shortDescription category').lean() as { title: string; shortDescription: string; category: string } | null;
    if (caseDoc) {
      systemContext = `Кейс: «${caseDoc.title}». Категория: ${caseDoc.category}. Кратко: ${caseDoc.shortDescription}`;
    }
  }
  const aiContent = await chatWithAI(aiMessages, systemContext);

  const assistantMsg = await ChatMessage.create({
    conversationId: convDoc._id,
    role: 'assistant',
    content: aiContent,
    imageUrls: [],
  });

  res.json({
    conversationId: convDoc._id.toString(),
    userMessage: {
      _id: userMsg._id.toString(),
      role: 'user',
      content: userMsg.content,
      imageUrls: userMsg.imageUrls,
      createdAt: userMsg.createdAt,
    },
    assistantMessage: {
      _id: assistantMsg._id.toString(),
      role: 'assistant',
      content: assistantMsg.content,
      imageUrls: [],
      createdAt: assistantMsg.createdAt,
    },
  });
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file || !req.file.buffer) throw new AppError('Файл не загружен', 400);
  if (isCloudinaryConfigured()) {
    const url = await uploadImageBuffer(req.file.buffer, 'chat');
    res.json({ url });
    return;
  }
  const ext = path.extname(req.file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const filepath = path.join(UPLOAD_CHAT_DIR, filename);
  fs.writeFileSync(filepath, req.file.buffer);
  res.json({ url: `${API_BASE}/uploads/chat/${filename}` });
}

export async function listConversationsAdmin(_req: Request, res: Response): Promise<void> {
  const list = await Conversation.find()
    .sort({ updatedAt: -1 })
    .populate('userId', 'email name')
    .lean();

  const withPreview = await Promise.all(
    list.map(async (c) => {
      const last = await ChatMessage.findOne({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .lean();
      const uid = c.userId as { _id: unknown; email?: string; name?: string } | null;
      return {
        _id: c._id.toString(),
        sessionId: c.sessionId,
        user: uid
          ? {
              id: (uid._id as { toString?: () => string })?.toString?.(),
              email: uid.email,
              name: uid.name,
            }
          : null,
        lastMessage: last
          ? { content: last.content?.slice(0, 80), role: last.role, createdAt: last.createdAt }
          : null,
        updatedAt: c.updatedAt,
      };
    })
  );

  res.json(withPreview);
}

export async function getConversationAdmin(req: Request, res: Response): Promise<void> {
  const conv = await Conversation.findById(req.params.id)
    .populate('userId', 'email name')
    .lean();
  if (!conv) throw new AppError('Диалог не найден', 404);

  const messages = await ChatMessage.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .lean();

  const uid = conv.userId as { _id: unknown; email?: string; name?: string } | null;
  res.json({
    conversation: {
      _id: conv._id.toString(),
      sessionId: conv.sessionId,
      user: uid
        ? {
            id: (uid._id as { toString?: () => string })?.toString?.(),
            email: uid.email,
            name: uid.name,
          }
        : null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    },
    messages: messages.map((m) => ({
      _id: m._id.toString(),
      role: m.role,
      content: m.content,
      imageUrls: m.imageUrls ?? [],
      createdAt: m.createdAt,
    })),
  });
}
