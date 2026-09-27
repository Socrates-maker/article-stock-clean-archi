import {
  ArticleRepositoryPort,
  Page,
  PageQuery,
} from "../../domain/ports/article-repository.port";
import { Article } from "../../domain/entities/article.entity";

export class InMemoryArticleRepository implements ArticleRepositoryPort {
  public articles: Article[] = [];

  async save(article: Article): Promise<void> {
    const index = this.articles.findIndex((a) => a.id === article.id);
    if (index === -1) {
      this.articles.push(article);
      return;
    }
    this.articles[index] = article;
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.find((a) => a.id === id) ?? null;
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    return this.articles.filter((a) => a.authorId === authorId);
  }

  async findAll({ skip, take }: PageQuery): Promise<Page<Article>> {
    // Même tri que l'adaptateur Prisma, sinon les tests mentiraient sur l'ordre.
    const sorted = [...this.articles].sort(
      (a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime() ||
        b.id.localeCompare(a.id),
    );

    return {
      items: sorted.slice(skip, skip + take),
      total: this.articles.length,
    };
  }

  async delete(id: string): Promise<void> {
    this.articles = this.articles.filter((a) => a.id !== id);
  }
}
