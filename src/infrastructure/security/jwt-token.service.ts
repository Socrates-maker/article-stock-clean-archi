import { createHmac, timingSafeEqual } from "node:crypto";
import {
  AuthTokenPayload,
  TokenServicePort,
} from "../../domain/ports/token-service.port";
import { UnauthorizedError } from "../../domain/errors/domain.error";

interface JwtClaims extends AuthTokenPayload {
  iat: number;
  exp: number;
}

/**
 * Implémentation minimale d'un JWT HS256 avec `node:crypto`.
 * Suffisant pour un jeton d'accès signé côté serveur, sans dépendance externe.
 */
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number = 60 * 60, // 1 heure
  ) {
    if (!secret) {
      throw new Error("JWT_SECRET manquant : impossible de signer les jetons");
    }
  }

  sign(payload: AuthTokenPayload): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const claims: JwtClaims = {
      ...payload,
      iat: issuedAt,
      exp: issuedAt + this.expiresInSeconds,
    };

    const header = this.encode({ alg: "HS256", typ: "JWT" });
    const body = this.encode(claims);
    return `${header}.${body}.${this.signature(`${header}.${body}`)}`;
  }

  verify(token: string): AuthTokenPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedError("Jeton malformé");
    }

    const [header, body, providedSignature] = parts as [string, string, string];

    const expected = Buffer.from(this.signature(`${header}.${body}`));
    const provided = Buffer.from(providedSignature);
    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      throw new UnauthorizedError("Signature du jeton invalide");
    }

    let claims: JwtClaims;
    try {
      claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    } catch {
      throw new UnauthorizedError("Jeton illisible");
    }

    if (typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) {
      throw new UnauthorizedError("Jeton expiré");
    }

    return { sub: claims.sub, email: claims.email };
  }

  private encode(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private signature(data: string): string {
    return createHmac("sha256", this.secret).update(data).digest("base64url");
  }
}
