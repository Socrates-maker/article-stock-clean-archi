import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { Article } from "../../domain/entities/article.entity";

export interface ListArticlesDTO {
  page?: number;
  limit?: number;
}

export interface ListArticlesResult {
  items: Article[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Valeurs appliquées quand l'appelant ne précise rien. */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
/** Plafond : empêche un `?limit=100000` de ramener toute la table. */
export const MAX_LIMIT = 100;

/**
 * Liste publique et paginée de tous les articles.
 * Aucune notion d'utilisateur ici : la route est volontairement non protégée.
 */
export class ListArticlesUseCase {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(input: ListArticlesDTO = {}): Promise<ListArticlesResult> {
    // Le use case reste sûr même appelé hors HTTP (tests, CLI, worker) :
    // il ne fait pas confiance à la validation faite en amont.
    const page = Math.max(1, Math.trunc(input.page ?? DEFAULT_PAGE));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.trunc(input.limit ?? DEFAULT_LIMIT)),
    );

    const { items, total } = await this.articleRepository.findAll({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
