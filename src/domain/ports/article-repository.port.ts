import { Article } from "../entities/article.entity";

/** Fenêtre de lecture demandée au dépôt, exprimée en éléments. */
export interface PageQuery {
  skip: number;
  take: number;
}

/**
 * Une page de résultats accompagnée du total : le total ne peut être calculé
 * qu'au niveau du dépôt (SQL `COUNT`), pas après découpage.
 */
export interface Page<T> {
  items: T[];
  total: number;
}

export interface ArticleRepositoryPort {
  save(article: Article): Promise<void>;
  findById(id: string): Promise<Article | null>;
  findByAuthorId(authorId: string): Promise<Article[]>;
  findAll(page: PageQuery): Promise<Page<Article>>;
  delete(id: string): Promise<void>;
}
