import { ArticleRepositoryPort } from "../../../domain/ports/article-repository.port";
import { PrismaClient } from "../../../generated/prisma/client";
import { Article } from "../../../domain/entities/article.entity";
import { ArticleMapper } from "../mappers/article.mapper";

export class PrismaArticleRepositoryAdapter implements ArticleRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Article> {
    const rawArticle = await this.prisma.articleModel.findUnique({
      where: { id },
    });
    if (!rawArticle) return null;
    return ArticleMapper.toDomain(rawArticle);
  }

  async save(article: Article): Promise<void> {
    const data = ArticleMapper.toPersistence(article);
    await this.prisma.articleModel.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    const rawArticles = await this.prisma.articleModel.findMany({
      where: { authorId },
    });
    return rawArticles.map((ra) => ArticleMapper.toDomain(ra));
  }
}
