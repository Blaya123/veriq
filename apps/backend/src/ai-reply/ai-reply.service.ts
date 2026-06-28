import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GenerateReplyOptions {
  tone?: 'professional' | 'friendly' | 'formal';
  context?: string;
}

export interface AiReplyResult {
  reply: string;
  suggestedActions: string[];
  sentiment: string;
}

@Injectable()
export class AiReplyService {
  constructor(private prisma: PrismaService) {}

  async generateReply(conversationId: string, options: GenerateReplyOptions = {}): Promise<AiReplyResult> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 20 },
        contact: true,
      },
    });
    if (!conversation) throw new BadRequestException('Conversation not found');

    const history = conversation.messages.reverse().map((m) => ({
      role: m.direction === 'INBOUND' ? 'user' : 'assistant',
      content: m.content,
    }));

    const tone = options.tone ?? 'professional';
    const reply = await this.callAiProvider(history, tone, options.context);
    const sentiment = await this.analyzeSentiment(conversation.messages[0]?.content ?? '');
    const suggestedActions = await this.suggestNextAction(conversationId);

    return { reply, suggestedActions, sentiment };
  }

  async analyzeSentiment(text: string): Promise<string> {
    if (!text) return 'neutral';
    const positiveWords = ['great', 'awesome', 'thanks', 'love', 'perfect', 'happy', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed'];

    const lower = text.toLowerCase();
    const positiveCount = positiveWords.filter((w) => lower.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => lower.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  async suggestNextAction(conversationId: string): Promise<string[]> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!conversation) return [];

    const lastMessage = conversation.messages[0]?.content?.toLowerCase() ?? '';
    const actions: string[] = [];

    if (lastMessage.includes('invoice') || lastMessage.includes('bill') || lastMessage.includes('payment')) {
      actions.push('send_invoice');
    }
    if (lastMessage.includes('meeting') || lastMessage.includes('schedule') || lastMessage.includes('appointment')) {
      actions.push('book_meeting');
    }
    if (lastMessage.includes('complaint') || lastMessage.includes('escalate') || lastMessage.includes('manager')) {
      actions.push('transfer_to_human');
    }

    actions.push('send_follow_up');
    return actions;
  }

  async autoRespond(conversationId: string): Promise<{ replied: boolean; reply?: string }> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!conversation) throw new BadRequestException('Conversation not found');

    const lastMessage = conversation.messages[0];
    if (!lastMessage || lastMessage.direction === 'OUTBOUND') {
      return { replied: false };
    }

    const sentiment = await this.analyzeSentiment(lastMessage.content);
    let reply: string;

    if (sentiment === 'negative') {
      reply = "I understand your frustration. Let me connect you with a team member who can help resolve this.";
      return { replied: true, reply };
    }

    const result = await this.generateReply(conversationId, { tone: 'friendly' });
    return { replied: true, reply: result.reply };
  }

  private async callAiProvider(
    history: { role: string; content: string }[],
    tone: string,
    context?: string,
  ): Promise<string> {
    const provider = process.env.AI_PROVIDER || 'openai';
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return this.fallbackReply(history, tone);
    }

    try {
      if (provider === 'openai' || provider === 'openrouter' || provider === 'groq') {
        return this.callOpenAI(history, tone, apiKey, context, provider);
      }
      return this.fallbackReply(history, tone);
    } catch {
      return this.fallbackReply(history, tone);
    }
  }

  private async callOpenAI(
    history: { role: string; content: string }[],
    tone: string,
    apiKey: string,
    context?: string,
    provider?: string,
  ): Promise<string> {
    const systemPrompt = `You are a helpful customer support assistant. Respond in a ${tone} tone. Keep responses concise and professional.${context ? ` Context: ${context}` : ''}`;
    const messages = [{ role: 'system', content: systemPrompt }, ...history];
    let baseUrl = 'https://api.openai.com';
    if (provider === 'openrouter') baseUrl = 'https://openrouter.ai/api/v1';
    if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = process.env.FRONTEND_URL || '';
    }
    let defaultModel = 'gpt-4';
    if (provider === 'openrouter') defaultModel = 'mistralai/mistral-7b-instruct';
    if (provider === 'groq') defaultModel = 'llama-3.1-8b-instant';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: process.env.AI_MODEL || defaultModel,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? this.fallbackReply(history, tone);
  }

  private fallbackReply(history: { role: string; content: string }[], tone: string): string {
    const lastUserMessage = history.filter((m) => m.role === 'user').pop();
    if (!lastUserMessage) return 'How can I help you today?';

    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon'];
    const lower = lastUserMessage.content.toLowerCase();

    if (greetings.some((g) => lower.includes(g))) {
      return 'Hello! How can I assist you today?';
    }
    if (lower.includes('help')) {
      return "I'd be happy to help you. Could you provide more details about your question?";
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
      return 'For pricing information, could you please share your email so our sales team can reach out with a customized quote?';
    }
    if (lower.includes('refund') || lower.includes('cancel')) {
      return 'I understand you want to cancel or request a refund. Let me transfer you to our billing team who can assist further.';
    }

    return 'Thank you for your message. A team member will get back to you shortly.';
  }
}
