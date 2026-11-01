/** PostgreSQL SQLSTATE 23505 = unique_violation. Drizzle wraps driver errors, so check `cause` too. */
export function isUniqueViolation(err: unknown): boolean {
  let e: unknown = err;
  for (let depth = 0; e && typeof e === "object" && depth < 4; depth++) {
    if ((e as { code?: unknown }).code === "23505") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}
