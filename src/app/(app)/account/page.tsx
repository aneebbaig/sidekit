import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { authService } from "@/services/auth-service";
import { ChangePasswordForm } from "./change-password-form";
import { AiSettingsCard } from "./ai-settings-card";
import { TotpCard } from "./totp-card";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");
  const user = await authService.getCurrentUser(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <PageHeader title="Account" description="Owner profile and security settings." />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Name" value={user.name ?? "-"} />
          <Row label="Email" value={user.email} />
          <Row label="Member since" value={formatDate(user.createdAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <TotpCard initialEnabled={user.twoFactorEnabled ?? false} />

      <AiSettingsCard
        provider={user.aiProvider}
        model={user.aiModel}
        baseUrl={user.aiBaseUrl}
        hasKey={Boolean(user.aiApiKeyEncrypted)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground w-32 shrink-0">
        {label}
      </span>
      <span className="text-right break-words">{value}</span>
    </div>
  );
}
