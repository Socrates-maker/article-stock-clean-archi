import { Request, Response, NextFunction } from "express";
import { SaveArticleUseCase } from "../../../application/use-cases/save-article.usecase";
import { Article } from "../../../domain/entities/article.entity";
import { FindArticlesByUserByIdUsecase } from "../../../application/use-cases/find-articles-by-user-by-id.usecase";

export class ArticleController {
  constructor(
    private readonly createArticleUseCase: SaveArticleUseCase,
    private readonly findArticleByAuthorIdUseCase: FindArticlesByUserByIdUsecase,
  ) {}

  async findByAuthorId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { authorId } = req.params;
      const articles = await this.findArticleByAuthorIdUseCase.execute({
        authorId: authorId as string,
      });
      res.status(200).json({
        data: articles,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      //  req.body est déjà validé et typé par le middleware Zod !
      const article = await this.createArticleUseCase.execute(req.body);

      res.status(201).json({
        id: article.id,
        title: article.title,
        description: article.description,
        price: {
          amount: article.money.amount,
          currency: article.money.currency,
        },
        authorId: article.authorId,
        createdAt: article.createdAt,
      });
    } catch (error) {
      next(error); // Transmet l'erreur au errorHandler global
    }
  }
}
