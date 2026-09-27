import { Router, RequestHandler } from "express";
import { ArticleController } from "../controllers/article.controller";
import { validate } from "../middlewares/validate.middleware";
import { CreateArticleSchema } from "../dtos/create-article.schema";
import { UpdateArticleSchema } from "../dtos/update-article.schema";

/**
 * Regroupe toutes les routes liées à la ressource "articles".
 * Le préfixe "/articles" est monté dans main.ts via app.use().
 */
export function createArticleRouter(
  controller: ArticleController,
  authenticate: RequestHandler,
): Router {
  const router = Router();

  // Lecture publique : catalogue paginé, aucun jeton requis.
  router.get("/", controller.list);

  // Articles de l'appelant : l'identité vient du jeton, pas de l'URL.
  // Déclarée avant les routes paramétrées pour ne pas être capturée par "/:id".
  router.get("/me", authenticate, controller.findMine);

  // Création : l'auteur est déduit du jeton, d'où l'authentification requise.
  router.post(
    "/",
    authenticate,
    validate(CreateArticleSchema),
    controller.create,
  );

  // Modification / suppression : réservées au propriétaire de l'article.
  router.put(
    "/:id",
    authenticate,
    validate(UpdateArticleSchema),
    controller.update,
  );

  router.delete("/:id", authenticate, controller.remove);

  return router;
}
