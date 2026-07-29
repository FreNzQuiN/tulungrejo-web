export function getJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
  if (!raw) throw new Error("JWT_SECRET or AUTH_SECRET must be set");
  if (raw.length < 32)
    throw new Error(
      "JWT_SECRET or AUTH_SECRET must be at least 32 characters long",
    );
  return new TextEncoder().encode(raw);
}
