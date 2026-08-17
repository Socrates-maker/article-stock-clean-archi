import express from "express";
import "dotenv/config";

import { prisma } from "./infrastructure/database/prisma.client";
import { PrismaUserRepositoryAdapter } from "./infrastructure/database/adapters/prisma-user.repository";
import { ArticleController } from "./infrastructure/http/controllers/article.controller";

import { validate } from "./infrastructure/http/middlewares/validate.middleware";
import { CreateArticleSchema } from "./infrastructure/http/dtos/create-article.schema";
import { errorHandler } from "./infrastructure/http/middlewares/error.middleware";
import { SaveArticleUseCase } from "./application/use-cases/save-article.usecase";
import { PrismaArticleRepositoryAdapter } from "./infrastructure/database/adapters/prisma-article.repository";
import { FindArticlesByUserByIdUsecase } from "./application/use-cases/find-articles-by-user-by-id.usecase";

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // 1. Initialisation des Adaptateurs DB
  const userRepository = new PrismaUserRepositoryAdapter(prisma);
  const articleRepository = new PrismaArticleRepositoryAdapter(prisma);

  // 2. Initialisation des Use Cases
  const createArticleUseCase = new SaveArticleUseCase(
    articleRepository,
    userRepository,
  );

  const findArticleByAuthorIdUseCase = new FindArticlesByUserByIdUsecase(
    articleRepository,
    userRepository,
  );

  // 3. Initialisation des Contrôleurs
  const articleController = new ArticleController(
    createArticleUseCase,
    findArticleByAuthorIdUseCase,
  );

  // 4. Déclaration des Routes avec Middleware de Validation Zod
  app.post("/articles", validate(CreateArticleSchema), (req, res, next) =>
    articleController.create(req, res, next),
  );

  app.get("/articles/{:authorId}", (req, res, next) => {
    articleController.findByAuthorId(req, res, next);
  });

  // 5. Middleware Global de Gestion d'Erreurs (TOUJOURS en dernier !)
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  });
}

bootstrap();
