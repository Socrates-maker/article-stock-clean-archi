import { User } from "../../../domain/entities/user.entity";
import { UserModel } from "../../../generated/prisma/client";

export class UserMapper {
  // Conversion de la BDD vers le Domaine (Réhydratation)
  static toDomain(raw: UserModel): User {
    return new User(raw.id, raw.email, raw.name, raw.password, raw.createdAt);
  }

  // Conversion du Domaine vers la BDD (Persistance)
  static toPersistence(user: User): UserModel {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.passwordHash,
      createdAt: user.createdAt,
    };
  }
}
