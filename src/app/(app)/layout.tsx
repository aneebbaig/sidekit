import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { authService } from "@/services/auth-service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (await authService.needsSetup()) {
    redirect("/setup");
  }
  const session = await auth();
  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
  };
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
