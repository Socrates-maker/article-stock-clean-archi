import { z } from "zod";

import { RegisterUserSchema } from "../dtos/register-user.schema";
import { LoginUserSchema } from "../dtos/login-user.schema";
import { CreateArticleSchema } from "../dtos/create-article.schema";
import { UpdateArticleSchema } from "../dtos/update-article.schema";
import {
  ArticleListResponseSchema,
  ArticleResponseSchema,
  ErrorResponseSchema,
  LoginResponseSchema,
  PaginatedArticleListResponseSchema,
  UserResponseSchema,
  ValidationErrorResponseSchema,
} from "../dtos/responses.schema";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../application/use-cases/list-articles.usecase";

/**
 * Document OpenAPI 3.1 dérivé des schémas Zod.
 *
 * On ne réécrit aucun champ à la main : OpenAPI 3.1 est un sur-ensemble de
 * JSON Schema draft 2020-12, exactement ce que produit `z.toJSONSchema()`.
 * Modifier une règle de validation met donc la doc à jour automatiquement.
 */

type JsonSchema = Record<string, unknown>;

/** Convertit un schéma Zod en JSON Schema, sans la clé `$schema` (inutile ici). */
function toJsonSchema(
  schema: z.ZodType,
  io: "input" | "output" = "input",
): JsonSchema {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema, {
    io,
    target: "draft-2020-12",
  }) as JsonSchema;

  return rest;
}

const ref = (name: string): JsonSchema => ({
  $ref: `#/components/schemas/${name}`,
});

/**
 * Jeux d'exemples cohérents entre eux (même utilisateur, même article).
 *
 * Sans `example` explicite, Swagger UI fabrique lui-même une valeur à partir
 * du schéma : dès qu'un champ possède un `pattern` — ce que produit `z.email()` —
 * il génère une chaîne aléatoire satisfaisant la regex, illisible et inutilisable
 * dans « Try it out ». On fournit donc des valeurs réalistes.
 */
const USER_ID = "3f1a7c2e-9b4d-4f6a-8c21-0d5e7a9b1c34";
const ARTICLE_ID = "7b2d4e6f-1a3c-4d5e-9f80-2b4c6d8e0a12";
const CREATED_AT = "2026-08-17T10:30:00.000Z";

const userExample = {
  id: USER_ID,
  email: "socrate@example.com",
  name: "Socrates",
  createdAt: CREATED_AT,
};

const articleExample = {
  id: ARTICLE_ID,
  title: "Les Presocratiques",
  description: "Une introduction accessible a la philosophie presocratique.",
  price: { amount: 4500, currency: "XOF" },
  authorId: USER_ID,
  createdAt: CREATED_AT,
};

const jsonBody = (schemaName: string, example: unknown) => ({
  required: true,
  content: { "application/json": { schema: ref(schemaName), example } },
});

const jsonResponse = (
  description: string,
  schemaName: string,
  example?: unknown,
) => ({
  description,
  content: {
    "application/json": {
      schema: ref(schemaName),
      ...(example === undefined ? {} : { example }),
    },
  },
});

// Réponses d'erreur réutilisées par plusieurs opérations.
const BAD_REQUEST = jsonResponse(
  "Données de requête invalides",
  "ValidationErrorResponse",
  {
    status: "error",
    message: "Données de requête invalides",
    errors: [
      {
        field: "password",
        message: "Le mot de passe doit contenir au moins 8 caractères",
      },
    ],
  },
);
const UNAUTHORIZED = jsonResponse(
  "Jeton absent, invalide ou expiré",
  "ErrorResponse",
  { status: "error", message: "En-tête Authorization Bearer manquant" },
);
const FORBIDDEN = jsonResponse(
  "Vous n'êtes pas l'auteur de cet article",
  "ErrorResponse",
  {
    status: "error",
    message: "Vous ne pouvez modifier que vos propres articles",
  },
);
const NOT_FOUND = jsonResponse("Ressource introuvable", "ErrorResponse", {
  status: "error",
  message: "Article introuvable",
});

const BEARER_AUTH = [{ bearerAuth: [] }];
/** `security: []` déclare explicitement une opération publique (≠ non renseignée). */
const PUBLIC: never[] = [];

/** Paramètre de chemin partagé par GET/PUT/DELETE sur `/articles/{id}`. */
const idPathParam = (description: string, example: string) => [
  {
    name: "id",
    in: "path",
    required: true,
    description,
    schema: { type: "string", format: "uuid" },
    example,
  },
];

export const openApiDocument = {
  openapi: "3.1.0",

  info: {
    title: "API Articles — Clean Architecture",
    version: "1.0.0",
    license: { name: "ISC", identifier: "ISC" },
    description: [
      "API de gestion d'articles construite en architecture hexagonale.",
      "",
      "**Authentification** — appelez `POST /auth/register` puis `POST /auth/login`",
      "pour obtenir un jeton, puis cliquez sur *Authorize* et collez-le.",
      "L'auteur d'un article est toujours déduit du jeton, jamais du corps de requête.",
    ].join("\n"),
  },

  servers: [{ url: "/", description: "Serveur courant" }],

  tags: [
    { name: "Auth", description: "Inscription et connexion" },
    { name: "Articles", description: "Gestion des articles" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Jeton renvoyé par `POST /auth/login`.",
      },
    },

    schemas: {
      // Entrées — `io: "input"` pour que les champs à valeur par défaut
      // (ex. priceCurrency) apparaissent bien comme optionnels.
      RegisterUserInput: toJsonSchema(RegisterUserSchema, "input"),
      LoginUserInput: toJsonSchema(LoginUserSchema, "input"),
      CreateArticleInput: toJsonSchema(CreateArticleSchema, "input"),
      UpdateArticleInput: {
        ...toJsonSchema(UpdateArticleSchema, "input"),
        description:
          "Mise à jour partielle : tous les champs sont optionnels, mais au moins un doit être fourni.",
      },

      // Sorties
      UserResponse: toJsonSchema(UserResponseSchema, "output"),
      LoginResponse: toJsonSchema(LoginResponseSchema, "output"),
      ArticleResponse: toJsonSchema(ArticleResponseSchema, "output"),
      ArticleListResponse: toJsonSchema(ArticleListResponseSchema, "output"),
      PaginatedArticleListResponse: toJsonSchema(
        PaginatedArticleListResponseSchema,
        "output",
      ),
      ErrorResponse: toJsonSchema(ErrorResponseSchema, "output"),
      ValidationErrorResponse: toJsonSchema(
        ValidationErrorResponseSchema,
        "output",
      ),
    },
  },

  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        operationId: "registerUser",
        summary: "Inscrire un nouvel utilisateur",
        description:
          "Le mot de passe est haché (scrypt) avant stockage et n'est jamais renvoyé.",
        security: PUBLIC,
        requestBody: jsonBody("RegisterUserInput", {
          email: "socrate@example.com",
          name: "Socrates",
          password: "motdepasse123",
        }),
        responses: {
          "201": jsonResponse("Utilisateur créé", "UserResponse", userExample),
          "400": BAD_REQUEST,
          "409": jsonResponse("Cet email existe déjà", "ErrorResponse", {
            status: "error",
            message: "Cet email existe déjà",
          }),
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        operationId: "loginUser",
        summary: "Se connecter et obtenir un jeton",
        description:
          "En cas d'échec, le message est volontairement identique que l'email existe ou non (anti-énumération de comptes).",
        security: PUBLIC,
        requestBody: jsonBody("LoginUserInput", {
          email: "socrate@example.com",
          password: "motdepasse123",
        }),
        responses: {
          "200": jsonResponse("Connexion réussie", "LoginResponse", {
            token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjFhN2MyZS05YjRkLTRmNmEtOGMyMS0wZDVlN2E5YjFjMzQifQ.SIGNATURE",
            user: userExample,
          }),
          "400": BAD_REQUEST,
          "401": jsonResponse(
            "Email ou mot de passe incorrect",
            "ErrorResponse",
            { status: "error", message: "Email ou mot de passe incorrect" },
          ),
        },
      },
    },

    "/articles": {
      get: {
        tags: ["Articles"],
        operationId: "listArticles",
        summary: "Lister tous les articles (paginé)",
        description: [
          "Catalogue public : aucun jeton n'est requis.",
          "",
          "Les articles sont triés du plus récent au plus ancien.",
          `\`limit\` est plafonné à ${MAX_LIMIT} ; au-delà, la requête est rejetée en 400.`,
        ].join("\n"),
        security: PUBLIC,
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            description: "Numéro de page, à partir de 1.",
            schema: { type: "integer", minimum: 1, default: DEFAULT_PAGE },
            example: 1,
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Nombre d'articles par page.",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: MAX_LIMIT,
              default: DEFAULT_LIMIT,
            },
            example: DEFAULT_LIMIT,
          },
        ],
        responses: {
          "200": jsonResponse(
            "Page d'articles",
            "PaginatedArticleListResponse",
            {
              data: [articleExample],
              meta: { page: 1, limit: DEFAULT_LIMIT, total: 1, totalPages: 1 },
            },
          ),
          "400": BAD_REQUEST,
        },
      },

      post: {
        tags: ["Articles"],
        operationId: "createArticle",
        summary: "Créer un article",
        description:
          "L'auteur est déduit du jeton : `authorId` n'est pas accepté dans le corps de requête.",
        security: BEARER_AUTH,
        requestBody: jsonBody("CreateArticleInput", {
          title: "Les Presocratiques",
          description:
            "Une introduction accessible a la philosophie presocratique.",
          priceAmount: 4500,
          priceCurrency: "XOF",
        }),
        responses: {
          "201": jsonResponse(
            "Article créé",
            "ArticleResponse",
            articleExample,
          ),
          "400": BAD_REQUEST,
          "401": UNAUTHORIZED,
          "404": jsonResponse("Auteur introuvable", "ErrorResponse", {
            status: "error",
            message: "Auteur introuvable",
          }),
        },
      },
    },

    "/articles/me": {
      get: {
        tags: ["Articles"],
        operationId: "listMyArticles",
        summary: "Lister ses propres articles",
        description:
          "L'auteur est déduit du jeton : aucun identifiant n'est accepté dans l'URL.",
        security: BEARER_AUTH,
        responses: {
          "200": jsonResponse("Liste des articles", "ArticleListResponse", {
            data: [articleExample],
          }),
          "401": UNAUTHORIZED,
          "404": jsonResponse("Auteur introuvable", "ErrorResponse", {
            status: "error",
            message: "Auteur introuvable",
          }),
        },
      },
    },

    // PUT et DELETE partagent le même gabarit d'URL `/articles/{id}`,
    // où `{id}` désigne l'identifiant de l'ARTICLE.
    "/articles/{id}": {
      put: {
        tags: ["Articles"],
        operationId: "updateArticle",
        summary: "Mettre à jour un article",
        description: "Réservé à l'auteur de l'article.",
        security: BEARER_AUTH,
        parameters: idPathParam("Identifiant de l'article", ARTICLE_ID),
        requestBody: jsonBody("UpdateArticleInput", {
          title: "Les Presocratiques — 2e edition",
          priceAmount: 5000,
        }),
        responses: {
          "200": jsonResponse(
            "Article mis à jour",
            "ArticleResponse",
            articleExample,
          ),
          "400": BAD_REQUEST,
          "401": UNAUTHORIZED,
          "403": FORBIDDEN,
          "404": NOT_FOUND,
        },
      },

      delete: {
        tags: ["Articles"],
        operationId: "deleteArticle",
        summary: "Supprimer un article",
        description: "Réservé à l'auteur de l'article.",
        security: BEARER_AUTH,
        parameters: idPathParam("Identifiant de l'article", ARTICLE_ID),
        responses: {
          "204": { description: "Article supprimé (aucun contenu)" },
          "401": UNAUTHORIZED,
          "403": FORBIDDEN,
          "404": NOT_FOUND,
        },
      },
    },
  },
};
