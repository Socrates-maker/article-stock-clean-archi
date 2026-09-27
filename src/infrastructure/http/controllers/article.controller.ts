import { Request, Response, NextFunction } from "express";
import { SaveArticleUseCase } from "../../../application/use-cases/save-article.usecase";
import { Article } from "../../../domain/entities/article.entity";
import { FindArticlesByUserByIdUsecase } from "../../../application/use-cases/find-articles-by-user-by-id.usecase";
import { UpdateArticleUseCase } from "../../../application/use-cases/update-article.usecase";
import { DeleteArticleUseCase } from "../../../application/use-cases/delete-article.usecase";
import { ListArticlesUseCase } from "../../../application/use-cases/list-articles.usecase";
import { requireUserId } from "../middlewares/auth.middleware";
import {
  ArticleResponse,
  PaginatedArticleListResponse,
} from "../dtos/responses.schema";
import { ListArticlesQuerySchema } from "../dtos/list-articles.schema";

export class ArticleController {
  constructor(
    private readonly createArticleUseCase: SaveArticleUseCase,
    private readonly findArticleByAuthorIdUseCase: FindArticlesByUserByIdUsecase,
    private readonly updateArticleUseCase: UpdateArticleUseCase,
    private readonly deleteArticleUseCase: DeleteArticleUseCase,
    private readonly listArticlesUseCase: ListArticlesUseCase,
  ) {}

  /**
   * Liste publique et paginée de tous les articles.
   *
   * La query string est validée ici plutôt que via `validate()` : en Express 5,
   * `req.query` est en lecture seule, un middleware ne peut donc pas y réécrire
   * la valeur nettoyée par Zod.
   */
  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { page, limit } = ListArticlesQuerySchema.parse(req.query);

      const result = await this.listArticlesUseCase.execute({ page, limit });

      const body: PaginatedArticleListResponse = {
        data: result.items.map((article) => this.toResponse(article)),
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      res.status(200).json(body);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Articles de l'utilisateur connecté.
   * L'auteur est déduit du jeton : aucun identifiant n'est accepté en paramètre.
   */
  // Arrow function : le `this` est lié automatiquement,
  // on peut donc passer la méthode directement à Express.
  findMine = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const articles = await this.findArticleByAuthorIdUseCase.execute({
        authorId: requireUserId(req),
      });
      res.status(200).json({
        data: articles.map((article) => this.toResponse(article)),
      });
    } catch (e) {
      next(e);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      //  req.body est déjà validé et typé par le middleware Zod !
      //  L'auteur vient du jeton, pas du body.
      const article = await this.createArticleUseCase.execute({
        title: req.body.title,
        description: req.body.description,
        priceAmount: req.body.priceAmount,
        currency: req.body.priceCurrency,
        authorId: requireUserId(req),
      });

      res.status(201).json(this.toResponse(article));
    } catch (error) {
      next(error); // Transmet l'erreur au errorHandler global
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const article = await this.updateArticleUseCase.execute({
        articleId: req.params.id as string,
        requesterId: requireUserId(req),
        title: req.body.title,
        description: req.body.description,
        priceAmount: req.body.priceAmount,
        currency: req.body.priceCurrency,
      });

      res.status(200).json(this.toResponse(article));
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.deleteArticleUseCase.execute({
        articleId: req.params.id as string,
        requesterId: requireUserId(req),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Aplatit le Value Object Money pour la représentation HTTP.
   * Le type de retour est celui documenté dans OpenAPI : tout écart casse la compilation.
   */
  private toResponse(article: Article): ArticleResponse {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      price: {
        amount: article.money.amount,
        currency: article.money.currency,
      },
      authorId: article.authorId,
      createdAt: article.createdAt.toISOString(),
    };
  }
}
