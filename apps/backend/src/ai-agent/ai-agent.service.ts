import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AiAgentExecutionStatus } from '../lib/prisma-enums';

@Injectable()
export class AiAgentService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateAgentDto) {
    return this.prisma.aiAgent.create({
      data: {
        ...dto,
        model: dto.model || 'gpt-4',
        temperature: dto.temperature ?? 0.7,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.aiAgent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        executions: {
          take: 1,
          orderBy: { startedAt: 'desc' },
          select: { status: true, startedAt: true, input: true },
        },
        _count: { select: { executions: true } },
      },
    });
  }

  async findById(id: string, workspaceId: string) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id, workspaceId },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(id: string, workspaceId: string, dto: Partial<CreateAgentDto>) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id, workspaceId },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return this.prisma.aiAgent.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, workspaceId: string) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id, workspaceId },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    await this.prisma.aiAgentExecution.deleteMany({ where: { agentId: id } });
    await this.prisma.aiAgent.delete({ where: { id } });
    return { deleted: true };
  }

  async execute(agentId: string, workspaceId: string, input: string, triggeredBy: string) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id: agentId, workspaceId },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const execution = await this.prisma.aiAgentExecution.create({
      data: {
        agentId,
        triggeredBy,
        input,
        status: AiAgentExecutionStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const output = await this.callAiAgent(agent, input);
      return this.prisma.aiAgentExecution.update({
        where: { id: execution.id },
        data: {
          output,
          status: AiAgentExecutionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    } catch (err) {
      return this.prisma.aiAgentExecution.update({
        where: { id: execution.id },
        data: {
          output: (err as Error).message,
          status: AiAgentExecutionStatus.FAILED,
          completedAt: new Date(),
        },
      });
    }
  }

  async getExecutions(agentId: string, workspaceId: string) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id: agentId, workspaceId },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    return this.prisma.aiAgentExecution.findMany({
      where: { agentId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  private async callAiAgent(
    agent: { systemPrompt: string; model: string; temperature: number },
    input: string,
  ): Promise<string> {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) return `[Agent ${agent.model}] Simulated response to: ${input}`;

    const provider = process.env.AI_PROVIDER || 'openai';

    const messages = [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: input },
    ];

    try {
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: agent.model,
            messages,
            temperature: agent.temperature,
            max_tokens: 2000,
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? 'No response generated';
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
            model: agent.model,
            max_tokens: 2000,
            messages: [{ role: 'user', content: input }],
            system: agent.systemPrompt,
          }),
        });
        const data = await res.json();
        return data.content?.[0]?.text ?? 'No response generated';
      }

      if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${agent.model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: input }] }],
              systemInstruction: { parts: [{ text: agent.systemPrompt }] },
            }),
          },
        );
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated';
      }

      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: agent.model,
            messages,
            temperature: agent.temperature,
            max_tokens: 2000,
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? 'No response generated';
      }

      return `[${provider}] Response to: ${input}`;
    } catch {
      return `Error calling AI provider: ${input}`;
    }
  }
}
