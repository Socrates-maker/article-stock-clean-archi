import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";

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

  // 2. Gestion des erreurs métier du Domaine / Use Cases
  // (Vous pouvez créer des classes d'erreurs personnalisées comme UserNotFoundError)
  if (
    error.message.includes("introuvable") ||
    error.message.includes("non trouvé")
  ) {
    res.status(404).json({ status: "error", message: error.message });
    return;
  }

  if (
    error.message.includes("existe déjà") ||
    error.message.includes("invalide")
  ) {
    res.status(400).json({ status: "error", message: error.message });
    return;
  }

  // 3. Erreur serveur non gérée (500)
  console.error("🔥 Erreur serveur non gérée :", error);
  res.status(500).json({
    status: "error",
    message: "Une erreur interne est survenue sur le serveur",
  });
};
