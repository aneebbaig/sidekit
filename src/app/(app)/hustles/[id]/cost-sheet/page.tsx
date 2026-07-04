import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { costService } from "@/services/cost-service";
import { supplierService } from "@/services/supplier-service";
import { productService } from "@/services/product-service";
import { toNumber } from "@/lib/currency";
import { CostSheetBoard } from "./cost-sheet-board";

export default async function CostSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const [items, suppliers, products] = await Promise.all([
    costService.list(id),
    supplierService.list(id),
    productService.list(id),
  ]);

  const serialized = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    type: i.type,
    amount: toNumber(i.amount),
    unit: i.unit,
    quantity: toNumber(i.quantity),
    supplierId: i.supplierId,
    productId: i.productId,
    supplierName: i.supplier?.name ?? null,
    notes: i.notes,
    url: i.url ?? null,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Cost sheet"
        description="Break down every cost. Then explore margins with the live calculator."
      />
      <CostSheetBoard
        hustleId={id}
        currency={hustle.currency}
        items={serialized}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        products={products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            notes: p.notes,
            status: p.status as import("@/schemas/product").ProductStatusType,
            coverImageUrl: p.coverImageUrl,
          }))}
      />
    </div>
  );
}
