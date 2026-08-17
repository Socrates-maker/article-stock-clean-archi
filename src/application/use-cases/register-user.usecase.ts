import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';

export class RegisterUserUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    async execute(input: { email: string; name: string }): Promise<User> {
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw new Error('Cet email existe déjà');
        }

        const user = new User(crypto.randomUUID(), input.email, input.name);
        await this.userRepository.save(user);
        return user;
    }
}