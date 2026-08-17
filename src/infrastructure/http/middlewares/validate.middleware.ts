import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Valide et nettoie les données envoyées dans le body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error); // Transmet l'erreur Zod au middleware d'erreur global
    }
  };
};
