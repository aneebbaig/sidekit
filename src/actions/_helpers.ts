import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";

export async function requireUser(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function withAuth<T>(handler: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  const userId = await requireUser();
  if (!userId) return fail("Not authenticated.");
  return handler();
}

export function revalidateHustle(hustleId: string, section?: string, subId?: string) {
  revalidatePath(`/hustles/${hustleId}`);
  if (section) revalidatePath(`/hustles/${hustleId}/${section}`);
  if (subId && section) revalidatePath(`/hustles/${hustleId}/${section}/${subId}`);
}

export function revalidateGlobal() {
  revalidatePath("/");
  revalidatePath("/hustles");
  revalidatePath("/financials");
}
