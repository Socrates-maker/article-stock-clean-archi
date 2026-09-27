import express, { Express } from "express";
import cors from "cors";
import { Container } from "../di/container";
import { Env } from "../config/env";
import { createApiRouter } from "./routes";
import { createDocsRouter } from "./docs/docs.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";

/**
 * Construit l'application Express sans jamais l'écouter.
 * Séparer « construire » de « démarrer » permet de tester l'API
 * (supertest, etc.) sans ouvrir de port.
 */
export function createApp(container: Container, env: Env): Express {
  const app = express();

  // 1. Middlewares globaux
  // CORS en premier : la requête préliminaire (OPTIONS) doit recevoir sa
  // réponse avant tout parsing de corps ou toute authentification.
  app.use(
    cors({
      // Liste blanche explicite plutôt que "*" : indispensable dès qu'on
      // envoie un en-tête Authorization depuis le navigateur.
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(express.json());

  // 2. Documentation (avant les routes 404 ; désactivable en production)
  if (env.SWAGGER_ENABLED) {
    app.use(createDocsRouter());
  }

  // 3. Routes de l'API
  app.use(createApiRouter(container));

  // 4. Route inconnue -> 404 JSON (et non la page HTML par défaut d'Express)
  app.use(notFoundHandler);

  // 5. Gestion d'erreurs centralisée (TOUJOURS en dernier !)
  app.use(errorHandler);

  return app;
}
