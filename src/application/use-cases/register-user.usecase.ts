import { User } from "../../domain/entities/user.entity";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { PasswordHasherPort } from "../../domain/ports/password-hasher.port";
import { ConflictError } from "../../domain/errors/domain.error";

export interface RegisterUserDTO {
  email: string;
  name: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: RegisterUserDTO): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Cet email existe déjà");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = new User(
      crypto.randomUUID(),
      input.email,
      input.name,
      passwordHash,
    );

    await this.userRepository.save(user);
    return user;
  }
}
