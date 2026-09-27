import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/errors/domain.error";

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // 1. Gestion des erreurs de validation Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Données de requête invalides",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // 2. Erreurs métier du Domaine : elles portent elles-mêmes leur statut HTTP
  if (error instanceof DomainError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  // 3. Erreur serveur non gérée (500)
  console.error("🔥 Erreur serveur non gérée :", error);
  res.status(500).json({
    status: "error",
    message: "Une erreur interne est survenue sur le serveur",
  });
};
