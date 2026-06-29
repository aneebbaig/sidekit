import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

export function toErrorMessage(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return "A record with these details already exists.";
    if (err.code === "P2025") return "Record not found.";
    if (err.code === "P2003") return "Related record missing.";
    return `Database error (${err.code}).`;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error.";
}

export function logError(scope: string, err: unknown): void {
  const msg = toErrorMessage(err);
  console.error(`[${scope}] ${msg}`);
}
