import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import {
  ForbiddenError,
  NotFoundError,
} from "../../domain/errors/domain.error";

export interface DeleteArticleDTO {
  articleId: string;
  /** Utilisateur authentifié qui demande la suppression. */
  requesterId: string;
}

export class DeleteArticleUseCase {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(input: DeleteArticleDTO): Promise<void> {
    const article = await this.articleRepository.findById(input.articleId);
    if (!article) {
      throw new NotFoundError("Article introuvable");
    }

    if (!article.isOwnedBy(input.requesterId)) {
      throw new ForbiddenError(
        "Vous ne pouvez supprimer que vos propres articles",
      );
    }

    await this.articleRepository.delete(article.id);
  }
}
