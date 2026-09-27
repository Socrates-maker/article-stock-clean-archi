import { Request, Response, RequestHandler } from "express";

/** Uniformise la réponse aux routes inexistantes avec le format d'erreur de l'API. */
export const notFoundHandler: RequestHandler = (
  req: Request,
  res: Response,
): void => {
  res.status(404).json({
    status: "error",
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
};
