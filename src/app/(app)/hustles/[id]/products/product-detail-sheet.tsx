"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageOff, Maximize2, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Currency } from "@/components/shared/currency";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_BADGE_VARIANTS,
} from "@/schemas/product";
import { COST_CATEGORY_LABELS, COST_TYPE_LABELS } from "@/lib/constants";
import {
  listProductInspirationsAction,
  listProductCostItemsAction,
  createProductInspirationAction,
  deleteProductInspirationAction,
} from "@/actions/product-inspiration-actions";
import { ProductFormButton } from "../cost-sheet/product-form-button";
import type { ProductCardData } from "./product-grid";

interface Inspiration {
  id: string;
  imageUrl: string;
  title: string | null;
  notes: string | null;
}

interface CostItem {
  id: string;
  name: string;
  category: string;
  type: string;
  amount: number;
  quantity: number;
  unit: string;
}

interface Props {
  hustleId: string;
  currency: string;
  product: ProductCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InspirationImage({ url, onError }: { url: string; onError: () => void }) {
  return (
    <img
      src={url}
      alt=""
      className="w-full h-full object-cover"
      onError={onError}
    />
  );
}

function AddInspirationDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (data: { imageUrl: string; title: string; notes: string }) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [pending, setPending] = useState(false);

  function handleClose() {
    setImageUrl(""); setTitle(""); setNotes(""); setPreview(""); setPreviewError(false);
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setPending(true);
    await onAdd({ imageUrl: imageUrl.trim(), title, notes });
    setPending(false);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add inspiration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onBlur={() => { setPreview(imageUrl.trim()); setPreviewError(false); }}
            />
            <p className="text-[10px] text-muted-foreground">Paste any image URL - Pinterest, Etsy, Google Images, etc.</p>
          </div>
          {preview && !previewError && (
            <div className="rounded-lg overflow-hidden aspect-video bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>
          )}
          {previewError && (
            <p className="text-xs text-amber-400">Image couldn&apos;t be previewed - some sites block embedding. It may still display when saved.</p>
          )}
          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input placeholder="e.g. Rose gold color scheme" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea rows={2} placeholder="What you like about this..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={pending || !imageUrl.trim()}>
              {pending ? "Adding..." : "Add inspiration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDetailSheet({ hustleId, currency, product, open, onOpenChange }: Props) {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [loadingInspirations, setLoadingInspirations] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("inspirations");
  const [lightbox, setLightbox] = useState<{ url: string; title: string | null } | null>(null);

  useEffect(() => {
    if (!open || !product) return;
    let active = true;
    listProductInspirationsAction(product.id).then((res) => {
      if (!active) return;
      setInspirations(res.success ? (res.data as Inspiration[]) : []);
      setCosts([]);
      setBrokenImages(new Set());
      setActiveTab("inspirations");
      setLoadingInspirations(false);
    });
    return () => {
      active = false;
    };
  }, [open, product?.id]);

  async function handleTabChange(tab: string) {
    setActiveTab(tab);
    if (tab === "costs" && costs.length === 0 && product) {
      setLoadingCosts(true);
      const res = await listProductCostItemsAction(product.id);
      if (res.success) setCosts(res.data);
      setLoadingCosts(false);
    }
  }

  async function handleAddInspiration(data: { imageUrl: string; title: string; notes: string }) {
    if (!product) return;
    const res = await createProductInspirationAction(hustleId, product.id, {
      imageUrl: data.imageUrl,
      title: data.title || undefined,
      notes: data.notes || undefined,
    });
    if (!res.success) { toast.error(res.error); return; }
    setInspirations((prev) => [
      ...prev,
      { id: res.data.id, imageUrl: data.imageUrl, title: data.title || null, notes: data.notes || null },
    ]);
    toast.success("Inspiration added.");
  }

  async function handleDeleteInspiration(id: string, imageUrl: string) {
    const res = await deleteProductInspirationAction(hustleId, id);
    if (!res.success) { toast.error(res.error); return; }
    setInspirations((prev) => prev.filter((i) => i.id !== id));
    if (lightbox?.url === imageUrl) setLightbox(null);
    toast.success("Inspiration removed.");
  }

  if (!product) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border pr-12">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-lg leading-tight">{product.name}</SheetTitle>
                <Badge variant={PRODUCT_STATUS_BADGE_VARIANTS[product.status]} className="text-[10px]">
                  {PRODUCT_STATUS_LABELS[product.status]}
                </Badge>
                <ProductFormButton
                  hustleId={hustleId}
                  item={product}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              </div>
              {product.description ? (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              ) : null}
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col">
            <TabsList className="mx-6 mt-4 w-auto justify-start h-9 bg-muted/50">
              <TabsTrigger value="inspirations" className="text-xs">
                Inspirations {inspirations.length > 0 ? `(${inspirations.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="costs" className="text-xs">
                Costs {costs.length > 0 ? `(${costs.length})` : ""}
              </TabsTrigger>
              {product.notes ? <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger> : null}
            </TabsList>

            {/* Inspirations */}
            <TabsContent value="inspirations" className="px-6 pb-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  {inspirations.length === 0
                    ? "No inspirations yet. Add reference images from Pinterest, Etsy, or anywhere online."
                    : `${inspirations.length} reference image${inspirations.length !== 1 ? "s" : ""}`}
                </p>
                <Button size="sm" className="gap-1.5 h-8" onClick={() => setAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>

              {loadingInspirations ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton key={n} className="aspect-[4/3] rounded-lg" />
                  ))}
                </div>
              ) : inspirations.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ImageOff className="h-8 w-8 opacity-30" />
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add first inspiration
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inspirations.map((ins) => (
                    <div
                      key={ins.id}
                      className="group relative rounded-lg overflow-hidden aspect-[4/3] bg-muted border border-border cursor-pointer"
                      onClick={(e) => { if (e.detail === 0) return; if (!brokenImages.has(ins.id)) setLightbox({ url: ins.imageUrl, title: ins.title }); }}
                    >
                      {brokenImages.has(ins.id) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground p-3">
                          <ImageOff className="h-6 w-6 opacity-40" />
                          <p className="text-[10px] text-center break-all line-clamp-2 opacity-60">{ins.imageUrl}</p>
                          <a
                            href={ins.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open link <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      ) : (
                        <InspirationImage
                          url={ins.imageUrl}
                          onError={() => setBrokenImages((prev) => new Set(prev).add(ins.id))}
                        />
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end gap-1">
                          {!brokenImages.has(ins.id) && (
                            <button
                              className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setLightbox({ url: ins.imageUrl, title: ins.title }); }}
                            >
                              <Maximize2 className="h-3.5 w-3.5 text-white" />
                            </button>
                          )}
                          <a
                            href={ins.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-white" />
                          </a>
                          <ConfirmDialog
                            title="Remove this inspiration?"
                            confirmLabel="Remove"
                            onConfirm={() => handleDeleteInspiration(ins.id, ins.imageUrl)}
                            trigger={
                              <button
                                className="p-1 rounded bg-white/10 hover:bg-rose-500/60 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <X className="h-3.5 w-3.5 text-white" />
                              </button>
                            }
                          />
                        </div>
                        {ins.title ? (
                          <p className="text-xs text-white font-medium leading-tight line-clamp-2">{ins.title}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {/* Add card */}
                  <button
                    onClick={() => setAddOpen(true)}
                    className="aspect-[4/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Add inspiration</span>
                  </button>
                </div>
              )}
            </TabsContent>

            {/* Costs */}
            <TabsContent value="costs" className="px-6 pb-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">Cost items assigned to this product.</p>
                <Link href={`/hustles/${hustleId}/cost-sheet`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    Open Cost Sheet <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {loadingCosts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => <Skeleton key={n} className="h-12 rounded-lg" />)}
                </div>
              ) : costs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No cost items yet.{" "}
                  <Link href={`/hustles/${hustleId}/cost-sheet`} className="text-primary hover:underline">
                    Add them in the Cost Sheet →
                  </Link>
                </p>
              ) : (
                <div className="space-y-1">
                  {costs.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{COST_CATEGORY_LABELS[c.category as keyof typeof COST_CATEGORY_LABELS]}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={c.type === "FIXED" ? "info" : "outline"} className="text-[10px]">
                          {COST_TYPE_LABELS[c.type as keyof typeof COST_TYPE_LABELS]}
                        </Badge>
                        <span className="text-sm font-mono">
                          <Currency value={c.amount * c.quantity} currency={currency} />
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-border mt-2 pt-2 flex justify-end">
                    <span className="text-xs text-muted-foreground mr-2">Total</span>
                    <span className="text-sm font-mono font-medium">
                      <Currency
                        value={costs.reduce((s, c) => s + c.amount * c.quantity, 0)}
                        currency={currency}
                      />
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Notes */}
            {product.notes ? (
              <TabsContent value="notes" className="px-6 pb-6 mt-4">
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{product.notes}</p>
              </TabsContent>
            ) : null}
          </Tabs>
        </SheetContent>
      </Sheet>

      <AddInspirationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddInspiration}
      />

      <Dialog open={!!lightbox} onOpenChange={(o) => { if (!o) setLightbox(null); }}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-black border-black">
          <div className="relative flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/80 pr-10">
              <a
                href={lightbox?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 text-white/60" />
              </a>
              <span className="text-sm text-white/70 truncate">{lightbox?.title ?? ""}</span>
            </div>
            {lightbox && (
              <img
                src={lightbox.url}
                alt={lightbox.title ?? ""}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
