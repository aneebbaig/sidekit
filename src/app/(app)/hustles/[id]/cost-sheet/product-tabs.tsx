"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Link from "next/link";
import { reorderProductsAction } from "@/actions/product-actions";
import type { ProductData } from "./product-form-button";

interface Props {
  hustleId: string;
  products: ProductData[];
  sharedCount: number;
  productCounts: Record<string, number>;
  activeTab: string;
  onTabChange: (id: string) => void;
}

const SHARED_TAB = "__shared__";

function SortableTab({
  product,
  isActive,
  count,
  onClick,
}: {
  product: ProductData;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer select-none ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3 opacity-40" />
      </span>
      {product.name}
      <span className="text-xs opacity-70">({count})</span>
    </div>
  );
}

export function ProductTabs({
  hustleId,
  products,
  sharedCount,
  productCounts,
  activeTab,
  onTabChange,
}: Props) {
  const [localProducts, setLocalProducts] = useState(products);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localProducts.findIndex((p) => p.id === active.id);
    const newIndex = localProducts.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(localProducts, oldIndex, newIndex);
    setLocalProducts(reordered);
    await reorderProductsAction(hustleId, reordered.map((p) => p.id));
  }

  return (
    <div className="flex items-center gap-1 flex-wrap border-b border-border pb-3">
      {/* Shared tab - not sortable */}
      <button
        onClick={() => onTabChange(SHARED_TAB)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === SHARED_TAB
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        Shared / Overhead
        <span className="ml-1.5 text-xs opacity-70">({sharedCount})</span>
      </button>

      {/* Sortable product tabs */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localProducts.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
          {localProducts.map((p) => (
            <SortableTab
              key={p.id}
              product={p}
              isActive={activeTab === p.id}
              count={productCounts[p.id] ?? 0}
              onClick={() => onTabChange(p.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Link
        href={`/hustles/${hustleId}/products`}
        className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        Manage products →
      </Link>
    </div>
  );
}
