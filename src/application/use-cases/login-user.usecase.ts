import { User } from "../../domain/entities/user.entity";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { PasswordHasherPort } from "../../domain/ports/password-hasher.port";
import { TokenServicePort } from "../../domain/ports/token-service.port";
import { UnauthorizedError } from "../../domain/errors/domain.error";

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginUserResult {
  user: User;
  token: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginUserDTO): Promise<LoginUserResult> {
    const user = await this.userRepository.findByEmail(input.email);

    // Message volontairement identique dans les deux cas : ne pas révéler
    // si l'email existe en base (évite l'énumération de comptes).
    if (!user) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const token = this.tokenService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }
}
