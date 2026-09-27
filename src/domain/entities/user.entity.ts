import { ValidationError } from "../errors/domain.error";

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    /** Empreinte du mot de passe. Le mot de passe en clair ne rentre jamais dans le domaine. */
    public readonly passwordHash: string,
    public readonly createdAt: Date = new Date(),
  ) {
    if (!email.includes("@")) {
      throw new ValidationError("Email invalide");
    }
  }
}
