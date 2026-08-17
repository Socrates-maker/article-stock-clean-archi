import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { User } from "../../domain/entities/user.entity";

export class InMemoryUserRepository implements UserRepositoryPort {
  public users: User[] = [
    {
      id: "1111",
      name: "socrates",
      email: "example@email.com",
      createdAt: new Date(),
    },
  ];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id);
  }
}
