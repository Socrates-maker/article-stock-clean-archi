import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { Article } from "../../domain/entities/article.entity";
import {
  ForbiddenError,
  NotFoundError,
} from "../../domain/errors/domain.error";

export interface UpdateArticleDTO {
  articleId: string;
  /** Utilisateur authentifié qui demande la modification. */
  requesterId: string;
  title?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
}

export class UpdateArticleUseCase {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(input: UpdateArticleDTO): Promise<Article> {
    const article = await this.articleRepository.findById(input.articleId);
    if (!article) {
      throw new NotFoundError("Article introuvable");
    }

    if (!article.isOwnedBy(input.requesterId)) {
      throw new ForbiddenError(
        "Vous ne pouvez modifier que vos propres articles",
      );
    }

    article.update({
      title: input.title,
      description: input.description,
      priceAmount: input.priceAmount,
      currency: input.currency,
    });

    await this.articleRepository.save(article);
    return article;
  }
}
