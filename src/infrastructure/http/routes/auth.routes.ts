import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { RegisterUserSchema } from "../dtos/register-user.schema";
import { LoginUserSchema } from "../dtos/login-user.schema";

/**
 * Routes d'authentification.
 * Le préfixe "/auth" est monté dans main.ts via app.use().
 */
export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validate(RegisterUserSchema), controller.register);
  router.post("/login", validate(LoginUserSchema), controller.login);

  return router;
}
