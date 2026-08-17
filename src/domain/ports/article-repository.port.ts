import { Article } from "../entities/article.entity";

export interface ArticleRepositoryPort {
  save(article: Article): Promise<void>;
  findById(id: string): Promise<Article | null>;
  findByAuthorId(authorId: string): Promise<Article[]>;
}
