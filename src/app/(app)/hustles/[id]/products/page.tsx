import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { productService } from "@/services/product-service";
import type { ProductStatusType } from "@/schemas/product";
import { ProductGrid } from "./product-grid";
import { ProductFormButton } from "../cost-sheet/product-form-button";

export default async function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;

  const products = await productService.listWithCounts(id);

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    notes: p.notes,
    status: p.status as ProductStatusType,
    coverImageUrl: p.coverImageUrl ?? p.inspirations[0]?.imageUrl ?? null,
    inspirationCount: p._count.inspirations,
    costItemCount: p._count.costItems,
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product designs, track R&D progress, and build inspiration boards."
        action={<ProductFormButton hustleId={id} />}
      />
      <ProductGrid hustleId={id} currency={hustle.currency} products={serialized} />
    </div>
  );
}
