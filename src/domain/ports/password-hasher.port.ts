/**
 * Port de hachage de mot de passe.
 * Le domaine ignore l'algorithme utilisé (scrypt, bcrypt, argon2…).
 */
export interface PasswordHasherPort {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, storedHash: string): Promise<boolean>;
}
