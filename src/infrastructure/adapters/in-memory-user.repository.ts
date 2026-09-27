import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { User } from "../../domain/entities/user.entity";

export class InMemoryUserRepository implements UserRepositoryPort {
  public users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      this.users.push(user);
      return;
    }
    this.users[index] = user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
}
