import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { inventoryService } from "@/services/inventory-service";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { toNumber } from "@/lib/currency";
import { InventoryTable } from "./inventory-table";
import { InventoryFormButton } from "./inventory-form-button";
import { InventoryImportButton } from "./inventory-import-button";

export default async function InventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const [items, totalValue] = await Promise.all([
    inventoryService.list(id),
    inventoryService.totalValue(id),
  ]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Inventory"
        description="Raw materials, packaging, and stocked items."
        action={
          <div className="flex gap-2">
            <InventoryImportButton hustleId={id} />
            <InventoryFormButton hustleId={id} />
          </div>
        }
      />

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total inventory value</p>
            <p className="text-2xl font-mono mt-1">
              <Currency value={totalValue} currency={hustle.currency} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Items tracked</p>
            <p className="text-2xl font-mono mt-1">{items.length}</p>
          </div>
        </CardContent>
      </Card>

      <InventoryTable
        hustleId={id}
        currency={hustle.currency}
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          sku: i.sku,
          unit: i.unit,
          quantity: toNumber(i.quantity),
          reorderAt: toNumber(i.reorderAt),
          unitCost: toNumber(i.unitCost),
          notes: i.notes,
          url: i.url,
        }))}
      />
    </div>
  );
}
