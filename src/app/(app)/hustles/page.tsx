import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { HustleList } from "./hustle-list";

interface SearchParams {
  status?: string;
  sort?: string;
}

export default async function HustlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const hustles = await hustleService.list();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Hustles"
        description="All businesses you operate."
      />
      <HustleList
        initialHustles={hustles}
        statusFilter={sp.status}
        sortFilter={sp.sort}
      />
    </div>
  );
}
