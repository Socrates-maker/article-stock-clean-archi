export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date = new Date(),
  ) {
    if (!email.includes("@")) {
      throw new Error("Email invalide");
    }
  }
}
