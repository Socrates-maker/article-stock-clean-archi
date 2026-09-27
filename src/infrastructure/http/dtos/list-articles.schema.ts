import { z } from "zod";

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../application/use-cases/list-articles.usecase";

/**
 * Paramètres de query string de `GET /articles`.
 *
 * Tout arrive en `string` depuis l'URL, d'où `z.coerce`. On refuse
 * explicitement les valeurs absurdes (page 0, limit 10000) plutôt que de les
 * corriger en silence : l'appelant doit savoir que sa requête était fausse.
 */
export const ListArticlesQuerySchema = z.object({
  page: z.coerce
    .number({ error: "Le numéro de page doit être un nombre" })
    .int("Le numéro de page doit être un entier")
    .min(1, "Le numéro de page doit être supérieur ou égal à 1")
    .default(DEFAULT_PAGE),
  limit: z.coerce
    .number({ error: "La limite doit être un nombre" })
    .int("La limite doit être un entier")
    .min(1, "La limite doit être supérieure ou égale à 1")
    .max(MAX_LIMIT, `La limite ne peut pas dépasser ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT),
});

export type ListArticlesQuery = z.infer<typeof ListArticlesQuerySchema>;
