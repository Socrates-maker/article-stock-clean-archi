import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Fabrique le PrismaClient à partir d'une chaîne de connexion explicite.
 * On évite volontairement un singleton lisant `process.env` à l'import :
 * la connexion devient un paramètre, donc substituable en test.
 *
 * L'adapter crée et possède son propre pool `pg` : `prisma.$disconnect()`
 * suffit alors à tout libérer à l'arrêt.
 */
export function createPrismaClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
