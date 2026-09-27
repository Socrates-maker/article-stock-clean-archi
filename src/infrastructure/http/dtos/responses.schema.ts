import { z } from "zod";

/**
 * Contrats de SORTIE de l'API.
 *
 * Ils servent deux usages à la fois :
 *  - générer la documentation OpenAPI ;
 *  - typer les présenteurs des contrôleurs (`private toResponse(...)`).
 *
 * Conséquence utile : si un contrôleur cesse de renvoyer un champ documenté,
 * TypeScript le refuse à la compilation — la doc ne peut plus dériver du code.
 */

export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserResponseSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const ArticleResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  authorId: z.uuid(),
  createdAt: z.iso.datetime(),
});
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;

export const ArticleListResponseSchema = z.object({
  data: z.array(ArticleResponseSchema),
});
export type ArticleListResponse = z.infer<typeof ArticleListResponseSchema>;

/** Métadonnées de pagination communes à toute liste paginée. */
export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const PaginatedArticleListResponseSchema = z.object({
  data: z.array(ArticleResponseSchema),
  meta: PaginationMetaSchema,
});
export type PaginatedArticleListResponse = z.infer<
  typeof PaginatedArticleListResponseSchema
>;

/** Format renvoyé par `errorHandler` pour toute erreur métier. */
export const ErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/** Format renvoyé par `errorHandler` sur échec de validation Zod. */
export const ValidationErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
});
export type ValidationErrorResponse = z.infer<
  typeof ValidationErrorResponseSchema
>;
