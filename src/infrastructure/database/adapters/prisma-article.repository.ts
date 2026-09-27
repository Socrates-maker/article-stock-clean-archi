import {
  ArticleRepositoryPort,
  Page,
  PageQuery,
} from "../../../domain/ports/article-repository.port";
import { PrismaClient } from "../../../generated/prisma/client";
import { Article } from "../../../domain/entities/article.entity";
import { ArticleMapper } from "../mappers/article.mapper";

export class PrismaArticleRepositoryAdapter implements ArticleRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Article | null> {
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

  async findAll({ skip, take }: PageQuery): Promise<Page<Article>> {
    // Une seule transaction pour la page et le total : sans cela, une écriture
    // concurrente entre les deux requêtes donnerait un `total` incohérent.
    const [rawArticles, total] = await this.prisma.$transaction([
      this.prisma.articleModel.findMany({
        skip,
        take,
        // Ordre stable et déterministe : sans `orderBy`, deux pages
        // successives peuvent renvoyer deux fois la même ligne.
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      this.prisma.articleModel.count(),
    ]);

    return {
      items: rawArticles.map((ra) => ArticleMapper.toDomain(ra)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.articleModel.delete({ where: { id } });
  }
}
