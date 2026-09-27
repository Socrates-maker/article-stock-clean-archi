import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { PasswordHasherPort } from "../../domain/ports/password-hasher.port";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

/**
 * Adaptateur de hachage basé sur scrypt (module `node:crypto`).
 * Aucune dépendance externe : scrypt est un KDF résistant au matériel dédié,
 * recommandé par l'OWASP au même titre qu'argon2id et bcrypt.
 *
 * Format stocké : "<salt hex>:<derived key hex>"
 */
export class ScryptPasswordHasher implements PasswordHasherPort {
  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derivedKey = await scryptAsync(plainPassword, salt, KEY_LENGTH);
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  async compare(plainPassword: string, storedHash: string): Promise<boolean> {
    const [saltHex, keyHex] = storedHash.split(":");
    if (!saltHex || !keyHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const expectedKey = Buffer.from(keyHex, "hex");
    const derivedKey = await scryptAsync(
      plainPassword,
      salt,
      expectedKey.length,
    );

    // Comparaison à temps constant : évite les attaques temporelles.
    return (
      derivedKey.length === expectedKey.length &&
      timingSafeEqual(derivedKey, expectedKey)
    );
  }
}
