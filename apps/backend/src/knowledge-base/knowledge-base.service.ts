import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/create-article.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateArticleDto) {
    return this.prisma.knowledgeArticle.create({
      data: {
        ...dto,
        tags: dto.tags ? JSON.stringify(dto.tags) : '[]',
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string, search?: string) {
    const where: any = { workspaceId };
    const lower = search?.toLowerCase();

    if (lower) {
      where.OR = [
        { title: { contains: lower } },
        { content: { contains: lower } },
      ];
    }

    return this.prisma.knowledgeArticle.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, workspaceId: string) {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: { id, workspaceId },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async update(id: string, workspaceId: string, dto: UpdateArticleDto) {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: { id, workspaceId },
    });
    if (!article) throw new NotFoundException('Article not found');
    const data: any = { ...dto };
    if (dto.tags) {
      data.tags = JSON.stringify(dto.tags);
    }
    return this.prisma.knowledgeArticle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, workspaceId: string) {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: { id, workspaceId },
    });
    if (!article) throw new NotFoundException('Article not found');
    await this.prisma.knowledgeArticle.delete({ where: { id } });
    return { deleted: true };
  }

  async search(workspaceId: string, query: string) {
    const lower = query.toLowerCase();
    return this.prisma.knowledgeArticle.findMany({
      where: {
        workspaceId,
        OR: [
          { title: { contains: lower } },
          { content: { contains: lower } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async getTags(workspaceId: string) {
    const articles = await this.prisma.knowledgeArticle.findMany({
      where: { workspaceId },
      select: { tags: true },
    });
    const tagSet = new Set<string>();
    for (const article of articles) {
      try {
        const parsed = JSON.parse(article.tags);
        if (Array.isArray(parsed)) {
          for (const tag of parsed) {
            tagSet.add(tag);
          }
        }
      } catch {
        if (article.tags) tagSet.add(article.tags);
      }
    }
    return Array.from(tagSet).sort();
  }

  async queryForRag(workspaceId: string, query: string, limit = 5) {
    const lower = query.toLowerCase();
    const articles = await this.prisma.knowledgeArticle.findMany({
      where: {
        workspaceId,
        OR: [
          { title: { contains: lower } },
          { content: { contains: lower } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content.substring(0, 2000),
      tags: this.parseTags(a.tags),
      score: this.simpleScore(
        { title: a.title, content: a.content, tags: this.parseTags(a.tags) },
        query,
      ),
    }));
  }

  private parseTags(tags: string): string[] {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tags ? tags.split(',').map((t) => t.trim()) : [];
    }
  }

  private simpleScore(
    article: { title: string; content: string; tags: string[] },
    query: string,
  ): number {
    const lower = query.toLowerCase();
    let score = 0;
    if (article.title.toLowerCase().includes(lower)) score += 3;
    if (article.content.toLowerCase().includes(lower)) score += 1;
    for (const tag of article.tags) {
      if (tag.toLowerCase().includes(lower)) score += 2;
    }
    return score;
  }
}
