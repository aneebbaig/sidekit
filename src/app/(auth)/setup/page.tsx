import { redirect } from "next/navigation";
import { authService } from "@/services/auth-service";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const needs = await authService.needsSetup();
  if (!needs) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-primary">Sidekit</div>
        <p className="text-sm text-muted-foreground">Create the owner account to get started.</p>
      </div>
      <SetupForm />
    </div>
  );
}
