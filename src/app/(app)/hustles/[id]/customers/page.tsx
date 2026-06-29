import { PageHeader } from "@/components/shared/page-header";
import { hustleService } from "@/services/hustle-service";
import { customerService } from "@/services/customer-service";
import { CustomersTable } from "./customers-table";
import { CustomerFormButton } from "./customer-form-button";

export default async function CustomersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) return null;
  const customers = await customerService.list(id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Customers"
        description="People you sell to."
        action={<CustomerFormButton hustleId={id} />}
      />
      <CustomersTable
        hustleId={id}
        currency={hustle.currency}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          city: c.city,
          address: c.address,
          source: c.source,
          notes: c.notes,
          orderCount: c._count.orders,
        }))}
      />
    </div>
  );
}
