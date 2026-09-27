export interface AuthTokenPayload {
  /** Identifiant de l'utilisateur (claim standard JWT "subject"). */
  sub: string;
  email: string;
}

/**
 * Port d'émission / vérification de jeton d'authentification.
 * L'implémentation (JWT HMAC, PASETO, session opaque…) vit en infrastructure.
 */
export interface TokenServicePort {
  sign(payload: AuthTokenPayload): string;
  /** Lève une UnauthorizedError si le jeton est invalide ou expiré. */
  verify(token: string): AuthTokenPayload;
}
