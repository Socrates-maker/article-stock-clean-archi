import { z } from "zod";

/**
 * Toute lecture de `process.env` est centralisée ici.
 * Les autres modules reçoivent un objet `Env` déjà validé et typé :
 * si une variable manque, le serveur refuse de démarrer avec un message clair
 * plutôt que d'échouer plus tard, au premier appel.
 */
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit faire au moins 32 caractères"),

  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60),

  /**
   * Origines autorisées par le CORS, séparées par des virgules.
   * Ex. : CORS_ORIGINS="http://localhost:5173,https://mon-front.example.com"
   *
   * L'en-tête `Origin` d'un navigateur ne porte JAMAIS de slash final :
   * on le retire donc pour qu'une valeur copiée depuis la barre d'adresse
   * ("http://localhost:5173/") fonctionne quand même.
   */
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter((origin) => origin.length > 0),
    ),

  /** Expose /docs et /docs.json. À passer à "false" en production. */
  SWAGGER_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration invalide (.env) :\n${details}`);
  }

  return result.data;
}
