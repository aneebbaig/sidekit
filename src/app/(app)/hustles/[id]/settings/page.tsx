import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hustleService } from "@/services/hustle-service";
import { HustleForm } from "../../hustle-form";
import { DangerZone } from "./danger-zone";
import { ApiKeyCard } from "./api-key-card";

export default async function HustleSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Configure this hustle." />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <HustleForm
            hustle={{
              id: hustle.id,
              name: hustle.name,
              color: hustle.color,
              description: hustle.description,
              currency: hustle.currency,
              status: hustle.status,
              websiteUrl: hustle.websiteUrl,
            }}
          />
        </CardContent>
      </Card>

      <ApiKeyCard hustleId={hustle.id} apiKey={hustle.apiKey ?? null} />

      <DangerZone hustleId={hustle.id} hustleName={hustle.name} />
    </div>
  );
}
