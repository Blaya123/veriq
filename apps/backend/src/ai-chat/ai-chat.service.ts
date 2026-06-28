import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AiChatRole } from '../lib/prisma-enums';

@Injectable()
export class AiChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(workspaceId: string, userId: string, dto: CreateChatDto) {
    return this.prisma.aiChat.create({
      data: {
        title: dto.title || 'New Chat',
        workspaceId,
        userId,
        systemPrompt: dto.systemPrompt,
      },
    });
  }

  async getChats(workspaceId: string, userId: string) {
    return this.prisma.aiChat.findMany({
      where: { workspaceId, userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async getChatById(id: string, workspaceId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: { id, workspaceId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async deleteChat(id: string, workspaceId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: { id, workspaceId },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    await this.prisma.aiChatMessage.deleteMany({ where: { chatId: id } });
    await this.prisma.aiChat.delete({ where: { id } });
    return { deleted: true };
  }

  async sendMessage(chatId: string, workspaceId: string, dto: SendMessageDto) {
    const chat = await this.prisma.aiChat.findFirst({
      where: { id: chatId, workspaceId },
    });
    if (!chat) throw new NotFoundException('Chat not found');

    const userMessage = await this.prisma.aiChatMessage.create({
      data: { chatId, role: AiChatRole.USER, content: dto.content },
    });

    const history = await this.prisma.aiChatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const assistantContent = await this.callAiProvider(history, chat.systemPrompt || undefined, dto.model);

    const assistantMessage = await this.prisma.aiChatMessage.create({
      data: { chatId, role: AiChatRole.ASSISTANT, content: assistantContent },
    });

    if (history.length === 1) {
      await this.prisma.aiChat.update({
        where: { id: chatId },
        data: { title: dto.content.substring(0, 100) },
      });
    }

    return { userMessage, assistantMessage };
  }

  async saveUserMessage(chatId: string, content: string) {
    return this.prisma.aiChatMessage.create({
      data: { chatId, role: AiChatRole.USER, content },
    });
  }

  async saveAssistantMessage(chatId: string, content: string) {
    const msg = await this.prisma.aiChatMessage.create({
      data: { chatId, role: AiChatRole.ASSISTANT, content },
    });

    const count = await this.prisma.aiChatMessage.count({ where: { chatId, role: AiChatRole.USER } });
    if (count === 1) {
      await this.prisma.aiChat.update({
        where: { id: chatId },
        data: { title: content.substring(0, 100) },
      });
    }

    return msg;
  }

  async getHistory(chatId: string, workspaceId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: { id: chatId, workspaceId },
    });
    if (!chat) throw new NotFoundException('Chat not found');

    return this.prisma.aiChatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  buildMessages(history: { role: string; content: string }[], systemPrompt?: string) {
    const messages: { role: string; content: string }[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of history) {
      const role = msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'assistant' : 'system';
      messages.push({ role, content: msg.content });
    }
    return messages;
  }

  async callAiProvider(
    history: { role: string; content: string }[],
    systemPrompt?: string,
    model?: string,
  ): Promise<string> {
    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'openai';
    const selectedModel = model || process.env.AI_MODEL || 'gpt-4';

    if (!apiKey) return this.fallbackResponse(history);

    const messages = this.buildMessages(history, systemPrompt);

    try {
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model: selectedModel, messages, temperature: 0.7, max_tokens: 2000 }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? this.fallbackResponse(history);
      }

      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: selectedModel,
            max_tokens: 2000,
            messages: messages.filter((m) => m.role !== 'system'),
            system: systemPrompt,
          }),
        });
        const data = await res.json();
        return data.content?.[0]?.text ?? this.fallbackResponse(history);
      }

      if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
            }),
          },
        );
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? this.fallbackResponse(history);
      }

      if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.FRONTEND_URL || '',
          },
          body: JSON.stringify({ model: selectedModel, messages, temperature: 0.7, max_tokens: 2000 }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? this.fallbackResponse(history);
      }

      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model: selectedModel, messages, temperature: 0.7, max_tokens: 2000 }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? this.fallbackResponse(history);
      }

      return this.fallbackResponse(history);
    } catch {
      return this.fallbackResponse(history);
    }
  }

  async *streamAiProvider(
    history: { role: string; content: string }[],
    systemPrompt?: string,
    model?: string,
  ): AsyncGenerator<string> {
    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'openai';
    const selectedModel = model || process.env.AI_MODEL || 'gpt-4';

    if (!apiKey) {
      yield this.fallbackResponse(history);
      return;
    }

    const messages = this.buildMessages(history, systemPrompt);

    try {
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          }),
        });

        const reader = res.body?.getReader();
        if (!reader) {
          yield this.fallbackResponse(history);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const text = json.choices?.[0]?.delta?.content || '';
                if (text) yield text;
              } catch {
                // skip parse errors
              }
            }
          }
        }
        return;
      }

      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: selectedModel,
            max_tokens: 2000,
            messages: messages.filter((m) => m.role !== 'system'),
            system: systemPrompt,
            stream: true,
          }),
        });

        const reader = res.body?.getReader();
        if (!reader) {
          yield this.fallbackResponse(history);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.type === 'content_block_delta' && json.delta?.text) {
                yield json.delta.text;
              }
            } catch {
              // skip parse errors
            }
          }
        }
        return;
      }

      if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.FRONTEND_URL || '',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          }),
        });

        const reader = res.body?.getReader();
        if (!reader) {
          yield this.fallbackResponse(history);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const text = json.choices?.[0]?.delta?.content || '';
                if (text) yield text;
              } catch {
                // skip parse errors
              }
            }
          }
        }
        return;
      }

      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          }),
        });
        const reader = res.body?.getReader();
        if (!reader) {
          yield this.fallbackResponse(history);
          return;
        }
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const text = json.choices?.[0]?.delta?.content || '';
                if (text) yield text;
              } catch {
                // skip parse errors
              }
            }
          }
        }
        return;
      }

      yield this.fallbackResponse(history);
    } catch {
      yield this.fallbackResponse(history);
    }
  }

  private fallbackResponse(history: { role: string; content: string }[]): string {
    const lastUser = [...history].reverse().find((m) => m.role === 'USER');
    if (!lastUser) return 'Hello! How can I help you today?';
    const lower = lastUser.content.toLowerCase();
    const greetings = ['hi', 'hello', 'hey'];
    if (greetings.some((g) => lower.includes(g))) {
      return 'Hello! How can I assist you today?';
    }
    return 'Thank you for your message. A team member will review and respond shortly.';
  }
}
