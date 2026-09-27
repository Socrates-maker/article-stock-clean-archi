import { z } from "zod";

export const LoginUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;
