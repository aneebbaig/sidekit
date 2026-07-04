import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock, Package, Truck, XCircle, ArrowLeft } from "lucide-react";
import { orderRepository } from "@/repositories/order-repository";
import { hustleRepository } from "@/repositories/hustle-repository";
import type { OrderStatus } from "@/generated/prisma/client";
import { CopyLinkButton } from "./copy-link-button";

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

const STEP_META: Record<OrderStatus, { label: string; description: string; Icon: React.ElementType }> = {
  PENDING: { label: "Pending", description: "Awaiting payment confirmation", Icon: Clock },
  CONFIRMED: { label: "Confirmed", description: "Order confirmed - production starting soon", Icon: CheckCircle2 },
  IN_PRODUCTION: { label: "In Production", description: "Your item is being crafted", Icon: Package },
  READY: { label: "Ready", description: "Finished & quality checked", Icon: CheckCircle2 },
  SHIPPED: { label: "Shipped", description: "On its way to you", Icon: Truck },
  DELIVERED: { label: "Delivered", description: "Delivered - enjoy!", Icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", description: "This order has been cancelled", Icon: XCircle },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await orderRepository.findById(orderId);
  if (!order) notFound();

  const hustle = await hustleRepository.findById(order.hustleId);
  const brandColor = hustle?.color ?? "#14b8a6";
  const brandName = hustle?.name ?? "HustleOS";
  const websiteUrl = hustle?.websiteUrl ?? null;
  const brandInitial = brandName.charAt(0).toUpperCase();

  const isCancelled = order.status === "CANCELLED";
  const currentIdx = isCancelled ? -1 : STEPS.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center gap-1 group"
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-lg"
                style={{ backgroundColor: brandColor }}
              >
                {brandInitial}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                {brandName}
              </span>
            </a>
          ) : (
            <div className="inline-flex flex-col items-center gap-1">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-lg"
                style={{ backgroundColor: brandColor }}
              >
                {brandInitial}
              </div>
              <p className="text-xs text-muted-foreground">{brandName}</p>
            </div>
          )}
        </div>

        {/* Order card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div>
            <p className="text-xs text-muted-foreground">Order</p>
            <p className="text-xl font-semibold">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{order.customerName}</p>
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Order Cancelled</p>
                <p className="text-sm text-muted-foreground">{STEP_META.CANCELLED.description}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {STEPS.map((step, idx) => {
                const done = idx < currentIdx;
                const active = idx === currentIdx;
                const { label, description } = STEP_META[step];
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle2
                          className="h-5 w-5 shrink-0"
                          style={{ color: brandColor }}
                        />
                      ) : active ? (
                        <div
                          className="h-5 w-5 rounded-full border-2 shrink-0"
                          style={{
                            borderColor: brandColor,
                            backgroundColor: `${brandColor}33`,
                          }}
                        />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                      )}
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-6 mt-1 ${done ? "" : "bg-border"}`}
                          style={done ? { backgroundColor: brandColor } : undefined}
                        />
                      )}
                    </div>
                    <div className="pb-1">
                      <p
                        className={`text-sm font-medium ${
                          active || done ? "text-foreground" : "text-muted-foreground/50"
                        }`}
                      >
                        {label}
                      </p>
                      {(active || done) && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Timeline */}
          {order.events.length > 0 && (
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">History</p>
              {order.events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0 pt-0.5">{formatDate(ev.createdAt)}</span>
                  <span className="font-medium">{STEP_META[ev.status as OrderStatus]?.label ?? ev.status}</span>
                  {ev.note && <span className="text-muted-foreground">- {ev.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <CopyLinkButton />
          <span className="text-muted-foreground/30">·</span>
          <a href="/track" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Look up another order
          </a>
        </div>
      </div>
    </div>
  );
}
