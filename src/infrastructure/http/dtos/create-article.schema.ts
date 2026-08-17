import { z } from "zod";

export const CreateArticleSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  priceAmount: z.number().positive("Le prix doit être supérieur à 0"),
  priceCurrency: z
    .string()
    .length(3, "La devise doit faire exactement 3 lettres (ex: EUR)")
    .default("EUR"),
  authorId: z.string().uuid("L'authorId doit être un UUID valide"),
});

// Type TypeScript inféré automatiquement depuis le schéma Zod
export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
