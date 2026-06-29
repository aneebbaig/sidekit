import { redirect } from "next/navigation";
import { authService } from "@/services/auth-service";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await authService.needsSetup()) {
    redirect("/setup");
  }
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-primary">Sidekit</div>
        <p className="text-sm text-muted-foreground">Sign in to your operating system.</p>
      </div>
      <LoginForm />
    </div>
  );
}
