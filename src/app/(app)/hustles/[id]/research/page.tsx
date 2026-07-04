import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { researchService } from "@/services/research-service";
import { ResearchBoard } from "./research-board";

export default async function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const notes = await researchService.list(id);

  const serialized = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category,
    tags: n.tags,
    pinned: n.pinned,
    updatedAt: n.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Research notes" description="A private notebook for everything you learn about this hustle." />
      <ResearchBoard hustleId={id} notes={serialized} />
    </div>
  );
}
