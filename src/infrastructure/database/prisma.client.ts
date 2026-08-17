import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Initialiser le pool de connexion natif 'pg'
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Créer l'adapter Prisma
const adapter = new PrismaPg(pool);

// 3. Exporter l'instance singleton du PrismaClient
export const prisma = new PrismaClient({ adapter });
