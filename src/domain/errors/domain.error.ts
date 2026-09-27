/**
 * Erreurs métier du domaine.
 * Elles portent leur propre code HTTP afin que la couche infrastructure
 * (errorHandler) n'ait pas à deviner le statut en inspectant le message.
 */
export abstract class DomainError extends Error {
  abstract readonly statusCode: number;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — la donnée fournie ne respecte pas une invariante métier. */
export class ValidationError extends DomainError {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/** 401 — identité non prouvée (token absent, invalide, ou identifiants faux). */
export class UnauthorizedError extends DomainError {
  readonly statusCode = 401;

  constructor(message = "Authentification requise") {
    super(message);
  }
}

/** 403 — identité connue mais droits insuffisants sur la ressource. */
export class ForbiddenError extends DomainError {
  readonly statusCode = 403;

  constructor(message = "Action non autorisée") {
    super(message);
  }
}

/** 404 — la ressource demandée n'existe pas. */
export class NotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
  }
}

/** 409 — la ressource entre en conflit avec une ressource existante. */
export class ConflictError extends DomainError {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
