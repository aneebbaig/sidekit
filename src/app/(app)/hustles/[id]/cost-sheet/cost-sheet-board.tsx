"use client";

import { useMemo, useState } from "react";
import type { CostCategory, CostType } from "@/generated/prisma/client";
import { ChevronDown, ChevronRight, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Currency } from "@/components/shared/currency";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COST_CATEGORIES, COST_CATEGORY_LABELS, COST_TYPE_LABELS } from "@/lib/constants";
import type { ProductStatusType } from "@/schemas/product";
import { CostItemFormButton } from "./cost-item-form-button";
import { CostImportButton } from "./cost-import-button";
import { ProductTabs } from "./product-tabs";
import { ProductFormButton, type ProductData } from "./product-form-button";
import { deleteCostItemAction, deleteManyCostItemsAction } from "@/actions/cost-actions";
import { deleteProductAction } from "@/actions/product-actions";
import { toast } from "sonner";
import { percent } from "@/lib/currency";

export interface CostItemData {
  id: string;
  name: string;
  category: CostCategory;
  type: CostType;
  amount: number;
  unit: string;
  quantity: number;
  supplierId: string | null;
  productId: string | null;
  supplierName: string | null;
  notes: string | null;
  url: string | null;
}

interface Props {
  hustleId: string;
  currency: string;
  items: CostItemData[];
  suppliers: { id: string; name: string }[];
  products: ProductData[];
}

const SHARED_TAB = "__shared__";

export function CostSheetBoard({ hustleId, currency, items, suppliers, products }: Props) {
  const [price, setPrice] = useState(1000);
  const [batch, setBatch] = useState(10);
  const [target, setTarget] = useState(50000);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<CostCategory>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(SHARED_TAB);

  const sharedItems = useMemo(() => items.filter((i) => !i.productId), [items]);
  const activeProductItems = useMemo(
    () => (activeTab === SHARED_TAB ? sharedItems : items.filter((i) => i.productId === activeTab)),
    [items, sharedItems, activeTab]
  );

  // Margin calc: product-specific variable costs + amortized shared fixed costs
  const productVariablePerUnit = useMemo(() => {
    const src = activeTab === SHARED_TAB ? sharedItems : activeProductItems;
    return src.filter((i) => i.type === "VARIABLE").reduce((s, i) => s + i.amount * i.quantity, 0);
  }, [activeTab, sharedItems, activeProductItems]);

  const sharedFixed = useMemo(
    () => sharedItems.filter((i) => i.type === "FIXED").reduce((s, i) => s + i.amount * i.quantity, 0),
    [sharedItems]
  );

  const totalFixed = useMemo(() => {
    if (activeTab === SHARED_TAB) {
      return sharedItems.filter((i) => i.type === "FIXED").reduce((s, i) => s + i.amount * i.quantity, 0);
    }
    const productFixed = activeProductItems.filter((i) => i.type === "FIXED").reduce((s, i) => s + i.amount * i.quantity, 0);
    return sharedFixed + productFixed;
  }, [activeTab, sharedItems, activeProductItems, sharedFixed]);

  const fixedPerUnit = batch > 0 ? totalFixed / batch : 0;
  const totalCostPerUnit = productVariablePerUnit + fixedPerUnit;
  const grossProfitPerUnit = price - totalCostPerUnit;
  const grossMargin = price > 0 ? (grossProfitPerUnit / price) * 100 : 0;
  const unitsForTarget = grossProfitPerUnit > 0 ? Math.ceil(target / grossProfitPerUnit) : Infinity;
  const breakEven = grossProfitPerUnit > 0 ? Math.ceil(totalFixed / grossProfitPerUnit) : Infinity;

  const monthlyRevenue = price * batch;
  const monthlyCost = totalCostPerUnit * batch;
  const monthlyProfit = grossProfitPerUnit * batch;
  const priceFor20 = totalCostPerUnit > 0 ? totalCostPerUnit / 0.80 : 0;
  const priceFor30 = totalCostPerUnit > 0 ? totalCostPerUnit / 0.70 : 0;
  const priceFor50 = totalCostPerUnit > 0 ? totalCostPerUnit / 0.50 : 0;

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleCategory(ids: string[], allChecked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleCollapse(cat: CostCategory) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  async function handleDelete(id: string) {
    const res = await deleteCostItemAction(hustleId, id);
    if (!res.success) toast.error(res.error);
    else {
      toast.success("Cost item deleted.");
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  async function handleDeleteSelected() {
    setDeleting(true);
    const ids = Array.from(selected);
    const res = await deleteManyCostItemsAction(hustleId, ids);
    setDeleting(false);
    if (!res.success) { toast.error(res.error); return; }
    toast.success(`Deleted ${res.data.count} item${res.data.count === 1 ? "" : "s"}.`);
    setSelected(new Set());
  }

  async function handleDeleteProduct(id: string) {
    const res = await deleteProductAction(hustleId, id);
    if (!res.success) { toast.error(res.error); return; }
    toast.success("Product deleted. Its cost items moved to shared.");
    if (activeTab === id) setActiveTab(SHARED_TAB);
  }

  const grouped = useMemo(() => {
    const map = new Map<CostCategory, CostItemData[]>();
    activeProductItems.forEach((i) => {
      const list = map.get(i.category) ?? [];
      list.push(i);
      map.set(i.category, list);
    });
    return Array.from(map.entries()).sort((a, b) => {
      return COST_CATEGORIES.indexOf(a[0]) - COST_CATEGORIES.indexOf(b[0]);
    });
  }, [activeProductItems]);

  const activeProduct = products.find((p) => p.id === activeTab);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">

        {/* Product tabs */}
        <ProductTabs
          hustleId={hustleId}
          products={products}
          sharedCount={sharedItems.length}
          productCounts={Object.fromEntries(products.map((p) => [p.id, items.filter((i) => i.productId === p.id).length]))}
          activeTab={activeTab}
          onTabChange={(id) => { setActiveTab(id); setSelected(new Set()); }}
        />

        {/* Tab header actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <ConfirmDialog
                title={`Delete ${selected.size} item${selected.size === 1 ? "" : "s"}?`}
                confirmLabel="Delete"
                onConfirm={handleDeleteSelected}
                trigger={
                  <Button variant="destructive" size="sm" className="gap-2" disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                    Delete {selected.size} selected
                  </Button>
                }
              />
            )}
            {activeProduct && (
              <div className="flex items-center gap-1">
                <ProductFormButton
                  hustleId={hustleId}
                  item={activeProduct}
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                      <Pencil className="h-3 w-3" /> Rename
                    </Button>
                  }
                />
                <ConfirmDialog
                  title={`Delete "${activeProduct.name}"?`}
                  description="Cost items assigned to this product will move to Shared / Overhead."
                  confirmLabel="Delete product"
                  onConfirm={() => handleDeleteProduct(activeProduct.id)}
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-rose-400 hover:text-rose-300">
                      <Trash2 className="h-3 w-3" /> Delete product
                    </Button>
                  }
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <CostImportButton hustleId={hustleId} defaultProductId={activeTab === SHARED_TAB ? "" : activeTab} />
            <CostItemFormButton
              hustleId={hustleId}
              suppliers={suppliers}
              products={products}
              defaultProductId={activeTab === SHARED_TAB ? "" : activeTab}
            />
          </div>
        </div>

        {grouped.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {activeTab === SHARED_TAB
                  ? "No shared costs yet. Add electricity, equipment, subscriptions here."
                  : "No costs for this product yet. Add raw materials and product-specific costs."}
              </p>
              <div className="mt-4 flex justify-center">
                <CostItemFormButton
                  hustleId={hustleId}
                  suppliers={suppliers}
                  products={products}
                  defaultProductId={activeTab === SHARED_TAB ? "" : activeTab}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          grouped.map(([cat, list]) => {
            const subtotal = list.reduce((s, i) => s + i.amount * i.quantity, 0);
            const catIds = list.map((i) => i.id);
            const allChecked = catIds.every((id) => selected.has(id));
            const someChecked = catIds.some((id) => selected.has(id));
            const isCollapsed = collapsed.has(cat);

            return (
              <Card key={cat}>
                <CardHeader
                  className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none"
                  onClick={() => toggleCollapse(cat)}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle>{COST_CATEGORY_LABELS[cat]}</CardTitle>
                    <Badge variant="outline">{list.length}</Badge>
                  </div>
                  <div className="text-sm" onClick={(e) => e.stopPropagation()}>
                    Subtotal: <Currency value={subtotal} currency={currency} className="ml-1" />
                  </div>
                </CardHeader>

                {!isCollapsed && (
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead className="border-t border-border bg-muted/20">
                        <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2">
                            <Checkbox
                              checked={allChecked}
                              data-state={someChecked && !allChecked ? "indeterminate" : undefined}
                              onCheckedChange={() => toggleCategory(catIds, allChecked)}
                            />
                          </th>
                          <th className="text-left px-3 py-2">Item</th>
                          <th className="text-left px-3 py-2">Type</th>
                          <th className="text-right px-3 py-2">Qty</th>
                          <th className="text-right px-3 py-2">Amount</th>
                          <th className="text-right px-3 py-2">Total</th>
                          <th className="px-2 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((i) => (
                          <tr
                            key={i.id}
                            className={`border-t border-border ${selected.has(i.id) ? "bg-muted/20" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <Checkbox
                                checked={selected.has(i.id)}
                                onCheckedChange={() => toggleItem(i.id)}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium">{i.name}</p>
                                {i.url ? (
                                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {i.supplierName ?? ""}{i.notes ? ` • ${i.notes}` : ""}
                              </p>
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant={i.type === "FIXED" ? "info" : "outline"} className="text-[10px]">
                                {COST_TYPE_LABELS[i.type]}
                              </Badge>
                            </td>
                            <td className="px-3 py-3 text-right font-mono">
                              {i.quantity} {i.unit}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Currency value={i.amount} currency={currency} />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Currency value={i.amount * i.quantity} currency={currency} />
                            </td>
                            <td className="px-2 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <CostItemFormButton
                                    hustleId={hustleId}
                                    suppliers={suppliers}
                                    products={products}
                                    item={i}
                                    trigger={
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Pencil className="h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                    }
                                  />
                                  <ConfirmDialog
                                    title="Delete this item?"
                                    confirmLabel="Delete"
                                    onConfirm={() => handleDelete(i.id)}
                                    trigger={
                                      <DropdownMenuItem
                                        className="text-rose-300 focus:text-rose-200"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    }
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Pricing calculator */}
      <Card className="xl:col-span-1 self-start sticky top-32">
        <CardHeader>
          <CardTitle>
            {activeTab === SHARED_TAB ? "Pricing calculator" : `Pricing - ${activeProduct?.name}`}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Costs pulled from your cost sheet automatically.
            {activeTab !== SHARED_TAB && " Includes shared overhead."}
          </p>
        </CardHeader>
        <CardContent className="space-y-5 overflow-y-auto max-h-[calc(100vh-14rem)]">

          {/* Inputs */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Units per month</Label>
              <p className="text-xs text-muted-foreground">How many units you plan to produce/sell monthly. Used to spread fixed costs like rent and electricity.</p>
              <Input type="number" value={batch} onChange={(e) => setBatch(Number(e.target.value) || 1)} min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>Your selling price (per unit)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Target monthly profit</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value) || 0)} min={0} />
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cost per unit (from cost sheet)</p>
            <Row label="Variable costs" value={<Currency value={productVariablePerUnit} currency={currency} />} hint="Materials, packaging, labour" />
            <Row
              label="Fixed costs"
              value={<Currency value={fixedPerUnit} currency={currency} />}
              hint={`${currency} ${totalFixed.toLocaleString(undefined, { maximumFractionDigits: 0 })} total ÷ ${batch} units`}
            />
            <Row label="Total cost / unit" value={<Currency value={totalCostPerUnit} currency={currency} />} emphasize />
          </div>

          {/* Suggested prices */}
          {totalCostPerUnit > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Suggested prices</p>
              <Row label="Break-even (0% margin)" value={<Currency value={totalCostPerUnit} currency={currency} />} />
              <Row label="20% margin" value={<Currency value={priceFor20} currency={currency} />} />
              <Row label="30% margin" value={<Currency value={priceFor30} currency={currency} />} />
              <Row label="50% margin" value={<Currency value={priceFor50} currency={currency} />} />
            </div>
          )}

          {/* At your price */}
          {price > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">At your price</p>
              <Row
                label="Profit per unit"
                value={
                  <Currency
                    value={grossProfitPerUnit}
                    currency={currency}
                    tone={grossProfitPerUnit >= 0 ? "positive" : "negative"}
                  />
                }
                emphasize
              />
              <Row
                label="Margin"
                value={
                  <span className={`font-mono ${grossMargin >= 30 ? "text-emerald-300" : grossMargin >= 10 ? "text-amber-300" : "text-rose-300"}`}>
                    {percent(grossMargin)}
                  </span>
                }
                emphasize
              />
              <Row label="Monthly revenue" value={<Currency value={monthlyRevenue} currency={currency} />} />
              <Row label="Monthly costs" value={<Currency value={monthlyCost} currency={currency} />} />
              <Row
                label="Monthly profit"
                value={
                  <Currency
                    value={monthlyProfit}
                    currency={currency}
                    tone={monthlyProfit >= 0 ? "positive" : "negative"}
                  />
                }
                emphasize
              />
            </div>
          )}

          {/* Goals */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Goals</p>
            <Row
              label="Units to break even"
              value={<span className="font-mono">{Number.isFinite(breakEven) ? breakEven.toLocaleString() : "-"}</span>}
            />
            <Row
              label={`Units for ${currency} ${target.toLocaleString()} / mo`}
              value={<span className="font-mono">{Number.isFinite(unitsForTarget) ? unitsForTarget.toLocaleString() : "-"}</span>}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, emphasize, hint }: { label: string; value: React.ReactNode; emphasize?: boolean; hint?: string }) {
  return (
    <div className={`flex items-start justify-between gap-2 text-sm ${emphasize ? "font-medium" : ""}`}>
      <div>
        <span className="text-muted-foreground">{label}</span>
        {hint ? <p className="text-[10px] text-muted-foreground/60 leading-tight">{hint}</p> : null}
      </div>
      <span className="shrink-0">{value}</span>
    </div>
  );
}
