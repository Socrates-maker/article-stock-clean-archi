import "dotenv/config";

import { loadEnv } from "./infrastructure/config/env";
import { createPrismaClient } from "./infrastructure/database/prisma.client";
import { createContainer } from "./infrastructure/di/container";
import { createApp } from "./infrastructure/http/app";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const prisma = createPrismaClient(env.DATABASE_URL);

  const app = createApp(createContainer({ prisma, env }), env);

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Serveur Express démarré sur http://localhost:${env.PORT}`);
    if (env.SWAGGER_ENABLED) {
      console.log(`📚 Documentation sur http://localhost:${env.PORT}/docs`);
    }
  });

  // Arrêt propre : on cesse d'accepter des requêtes, puis on ferme la BDD.
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} reçu, arrêt en cours…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("❌ Démarrage impossible :", error);
  process.exit(1);
});
