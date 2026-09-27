import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";

/**
 * Documentation interactive.
 *  - `GET /docs`      : interface Swagger UI
 *  - `GET /docs.json` : spécification OpenAPI brute (import Postman, codegen…)
 */
export function createDocsRouter(): Router {
  const router = Router();

  router.get("/docs.json", (_req, res) => {
    res.json(openApiDocument);
  });

  router.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "API Articles — Documentation",
      swaggerOptions: {
        // Conserve le jeton saisi dans « Authorize » d'un rechargement à l'autre.
        persistAuthorization: true,
      },
    }),
  );

  return router;
}
