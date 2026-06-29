import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hustleService } from "@/services/hustle-service";
import { supplierService } from "@/services/supplier-service";
import { COST_CATEGORY_LABELS, COST_TYPE_LABELS } from "@/lib/constants";
import { SupplierFormButton } from "../supplier-form-button";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string; supplierId: string }>;
}) {
  const { id, supplierId } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) notFound();
  const supplier = await supplierService.getById(supplierId);
  if (!supplier || supplier.hustleId !== id) notFound();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: "Suppliers", href: `/hustles/${id}/suppliers` },
          { label: supplier.name },
        ]}
        action={
          <SupplierFormButton
            hustleId={id}
            supplier={{
              id: supplier.id,
              name: supplier.name,
              contactName: supplier.contactName,
              phone: supplier.phone,
              email: supplier.email,
              website: supplier.website,
              city: supplier.city,
              rating: supplier.rating,
              preferred: supplier.preferred,
              notes: supplier.notes,
            }}
            trigger={<Button variant="outline">Edit</Button>}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Contact" value={supplier.contactName} />
            <Row label="Phone" value={supplier.phone} />
            <Row label="Email" value={supplier.email} />
            <Row label="Website" value={supplier.website} link />
            <Row label="City" value={supplier.city} />
            <Row
              label="Rating"
              value={
                supplier.rating > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary" />
                    {supplier.rating}/5
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Preferred"
              value={supplier.preferred ? <Badge variant="primary">Yes</Badge> : "No"}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{supplier.notes || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked cost items</CardTitle>
        </CardHeader>
        <CardContent>
          {supplier.costItems.length === 0 ? (
            <EmptyState
              title="No cost items linked"
              description="Items linked to this supplier on the Cost Sheet will appear here."
              action={
                <Button asChild variant="outline">
                  <Link href={`/hustles/${id}/cost-sheet`}>Open cost sheet</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier.costItems.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{COST_CATEGORY_LABELS[c.category]}</TableCell>
                    <TableCell>{COST_TYPE_LABELS[c.type]}</TableCell>
                    <TableCell className="text-right">
                      <Currency value={c.amount} currency={hustle.currency} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  link,
}: {
  label: string;
  value: React.ReactNode;
  link?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-right break-all">
        {link && typeof value === "string" ? (
          <Link href={value} target="_blank" className="text-primary hover:underline">
            {value}
          </Link>
        ) : (
          value || "—"
        )}
      </span>
    </div>
  );
}
