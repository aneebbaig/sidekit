import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { supplierService } from "@/services/supplier-service";
import { SuppliersTable } from "./suppliers-table";
import { SupplierFormButton } from "./supplier-form-button";
import { AiGenerateSupplierButton } from "./ai-generate-supplier-button";

export default async function SuppliersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const suppliers = await supplierService.list(id);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Suppliers"
        description="Vendors, manufacturers, and providers you work with."
        action={
          <div className="flex gap-2">
            <AiGenerateSupplierButton hustleId={id} />
            <SupplierFormButton hustleId={id} />
          </div>
        }
      />
      <SuppliersTable
        hustleId={id}
        suppliers={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          contactName: s.contactName,
          phone: s.phone,
          email: s.email,
          website: s.website,
          city: s.city,
          rating: s.rating,
          preferred: s.preferred,
          notes: s.notes,
        }))}
      />
    </div>
  );
}
