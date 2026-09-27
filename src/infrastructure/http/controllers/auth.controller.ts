import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/register-user.usecase";
import { LoginUserUseCase } from "../../../application/use-cases/login-user.usecase";
import { User } from "../../../domain/entities/user.entity";
import { UserResponse } from "../dtos/responses.schema";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(this.toPublicUser(user));
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { user, token } = await this.loginUserUseCase.execute(req.body);
      res.status(200).json({
        token,
        user: this.toPublicUser(user),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Ne jamais sérialiser `passwordHash` vers le client.
   * Le type de retour est celui documenté dans OpenAPI : tout écart casse la compilation.
   */
  private toPublicUser(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
