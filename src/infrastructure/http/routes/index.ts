import { Router } from "express";
import { Container } from "../../di/container";
import { createAuthRouter } from "./auth.routes";
import { createArticleRouter } from "./article.routes";

/**
 * Table de routage de l'API : un seul endroit à modifier pour ajouter
 * une ressource, plutôt qu'un `app.use()` de plus dans le bootstrap.
 */
export function createApiRouter(container: Container): Router {
  const router = Router();

  router.use("/auth", createAuthRouter(container.authController));
  router.use(
    "/articles",
    createArticleRouter(container.articleController, container.authenticate),
  );

  return router;
}
