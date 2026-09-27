-- AlterTable
-- Le DEFAULT temporaire permet de renseigner les lignes déjà présentes,
-- puis on le retire pour rendre le mot de passe obligatoire à l'insertion.
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "password" DROP DEFAULT;
