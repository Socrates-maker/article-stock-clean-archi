import { UserRepositoryPort } from "../../../domain/ports/user-repository.port";
import { User } from "../../../domain/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";
import { PrismaClient } from "../../../generated/prisma/client";

export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const rawUser = await this.prisma.userModel.findUnique({
      where: { email },
    });
    if (!rawUser) return null;
    return UserMapper.toDomain(rawUser);
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.prisma.userModel.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<User | null> {
    const rawUser = await this.prisma.userModel.findUnique({
      where: { id: id },
    });
    if (!rawUser) return null;
    return UserMapper.toDomain(rawUser);
  }
}
