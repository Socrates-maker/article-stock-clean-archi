import { z } from "zod";

/**
 * Mise à jour partielle : tous les champs sont optionnels,
 * mais le body ne peut pas être vide.
 */
export const UpdateArticleSchema = z
  .object({
    title: z
      .string()
      .min(3, "Le titre doit contenir au moins 3 caractères")
      .optional(),
    description: z
      .string()
      .min(10, "La description doit contenir au moins 10 caractères")
      .optional(),
    priceAmount: z
      .number()
      .positive("Le prix doit être supérieur à 0")
      .optional(),
    priceCurrency: z
      .string()
      .length(3, "La devise doit faire exactement 3 lettres (ex: EUR)")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
  });

export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
