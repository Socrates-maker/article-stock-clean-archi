import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { Article } from "../../domain/entities/article.entity";

export class InMemoryArticleRepository implements ArticleRepositoryPort {
  public articles: Article[] = [];

  async save(article: Article): Promise<void> {
    this.articles.push(article);
  }

  async findById(id: string): Promise<Article> {
    return this.articles.find((a) => a.id === id) || null;
  }
}
