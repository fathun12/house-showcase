import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes = 43 URL-safe characters (256 bits). Impossible to guess. */
export function generateToken() {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored in the database, never the token itself. */
export function hashToken(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex");
}