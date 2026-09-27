import { RequestHandler } from "express";

import { PrismaClient } from "../../generated/prisma/client";
import { Env } from "../config/env";

import { PrismaUserRepositoryAdapter } from "../database/adapters/prisma-user.repository";
import { PrismaArticleRepositoryAdapter } from "../database/adapters/prisma-article.repository";

import { ScryptPasswordHasher } from "../security/scrypt-password.hasher";
import { JwtTokenService } from "../security/jwt-token.service";

import { RegisterUserUseCase } from "../../application/use-cases/register-user.usecase";
import { LoginUserUseCase } from "../../application/use-cases/login-user.usecase";
import { SaveArticleUseCase } from "../../application/use-cases/save-article.usecase";
import { FindArticlesByUserByIdUsecase } from "../../application/use-cases/find-articles-by-user-by-id.usecase";
import { UpdateArticleUseCase } from "../../application/use-cases/update-article.usecase";
import { DeleteArticleUseCase } from "../../application/use-cases/delete-article.usecase";
import { ListArticlesUseCase } from "../../application/use-cases/list-articles.usecase";

import { AuthController } from "../http/controllers/auth.controller";
import { ArticleController } from "../http/controllers/article.controller";
import { authenticate } from "../http/middlewares/auth.middleware";

/**
 * Ce que le container expose à la couche HTTP : uniquement des points
 * d'entrée. Les repositories, use cases et adaptateurs restent internes.
 */
export interface Container {
  authController: AuthController;
  articleController: ArticleController;
  authenticate: RequestHandler;
}

export interface ContainerDependencies {
  prisma: PrismaClient;
  env: Env;
}

/**
 * Composition root : le SEUL endroit où l'on décide quelle implémentation
 * concrète branche quel port. Ajouter un use case se fait ici, et `main.ts`
 * n'a pas à le savoir.
 */
export function createContainer({
  prisma,
  env,
}: ContainerDependencies): Container {
  // --- Adaptateurs sortants (ports du domaine) ---
  const userRepository = new PrismaUserRepositoryAdapter(prisma);
  const articleRepository = new PrismaArticleRepositoryAdapter(prisma);

  const passwordHasher = new ScryptPasswordHasher();
  const tokenService = new JwtTokenService(
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN_SECONDS,
  );

  // --- Use cases ---
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
  );
  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  const saveArticleUseCase = new SaveArticleUseCase(
    articleRepository,
    userRepository,
  );
  const findArticlesByAuthorIdUseCase = new FindArticlesByUserByIdUsecase(
    articleRepository,
    userRepository,
  );
  const updateArticleUseCase = new UpdateArticleUseCase(articleRepository);
  const deleteArticleUseCase = new DeleteArticleUseCase(articleRepository);
  const listArticlesUseCase = new ListArticlesUseCase(articleRepository);

  // --- Adaptateurs entrants ---
  return {
    authController: new AuthController(registerUserUseCase, loginUserUseCase),

    articleController: new ArticleController(
      saveArticleUseCase,
      findArticlesByAuthorIdUseCase,
      updateArticleUseCase,
      deleteArticleUseCase,
      listArticlesUseCase,
    ),

    authenticate: authenticate(tokenService),
  };
}
