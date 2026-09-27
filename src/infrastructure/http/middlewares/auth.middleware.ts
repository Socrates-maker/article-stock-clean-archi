import { Request, Response, NextFunction, RequestHandler } from "express";
import { TokenServicePort } from "../../../domain/ports/token-service.port";
import { UnauthorizedError } from "../../../domain/errors/domain.error";

/** Requête enrichie par le middleware d'authentification. */
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Vérifie l'en-tête `Authorization: Bearer <token>` et expose
 * l'identité de l'appelant sur `req.userId`.
 */
export const authenticate = (
  tokenService: TokenServicePort,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        throw new UnauthorizedError("En-tête Authorization Bearer manquant");
      }

      const token = header.slice("Bearer ".length).trim();
      const payload = tokenService.verify(token);

      const authReq = req as AuthenticatedRequest;
      authReq.userId = payload.sub;
      authReq.userEmail = payload.email;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Récupère l'identité posée par `authenticate`.
 * Garde-fou si la route a été montée sans le middleware.
 */
export function requireUserId(req: Request): string {
  const { userId } = req as AuthenticatedRequest;
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
