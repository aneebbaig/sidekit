"use client";

import { useState } from "react";
import { ImageOff, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { ProductStatusType } from "@/schemas/product";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_BADGE_VARIANTS } from "@/schemas/product";
import { ProductFormButton } from "../cost-sheet/product-form-button";
import { ProductDetailSheet } from "./product-detail-sheet";

const CARD_GRADIENTS = [
  "from-violet-500/20 to-purple-700/20",
  "from-amber-500/20 to-orange-700/20",
  "from-emerald-500/20 to-teal-700/20",
  "from-rose-500/20 to-pink-700/20",
  "from-sky-500/20 to-blue-700/20",
];

export interface ProductCardData {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  status: ProductStatusType;
  coverImageUrl: string | null;
  inspirationCount: number;
  costItemCount: number;
}

interface Props {
  hustleId: string;
  currency: string;
  products: ProductCardData[];
}

function CoverImage({ url, gradient }: { url: string | null; gradient: string }) {
  const [error, setError] = useState(false);

  if (url && !error) {
    return (
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <ImageOff className="h-8 w-8 text-muted-foreground/30" />
    </div>
  );
}

export function ProductGrid({ hustleId, currency, products }: Props) {
  const [selected, setSelected] = useState<ProductCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first product design to start tracking costs and building inspiration boards."
        action={<ProductFormButton hustleId={hustleId} />}
      />
    );
  }

  function openProduct(p: ProductCardData) {
    setSelected(p);
    setSheetOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="group rounded-xl border border-border overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card"
            onClick={() => openProduct(p)}
          >
            {/* Cover */}
            <div className="aspect-[4/3] overflow-hidden">
              <CoverImage
                url={p.coverImageUrl}
                gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
              />
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight line-clamp-2">{p.name}</h3>
                <Badge variant={PRODUCT_STATUS_BADGE_VARIANTS[p.status]} className="shrink-0 text-[10px]">
                  {PRODUCT_STATUS_LABELS[p.status]}
                </Badge>
              </div>

              {p.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              ) : null}

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {p.inspirationCount} inspiration{p.inspirationCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {p.costItemCount} cost item{p.costItemCount !== 1 ? "s" : ""}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); openProduct(p); }}
              >
                View details →
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ProductDetailSheet
        hustleId={hustleId}
        currency={currency}
        product={selected}
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setSelected(null);
        }}
      />
    </>
  );
}
