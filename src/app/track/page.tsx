"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function TrackLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch(
      `/api/public/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}&customerName=${encodeURIComponent(customerName)}`,
    );
    setPending(false);
    if (!res.ok) {
      setError("Order not found. Check your order number and name.");
      return;
    }
    const data = await res.json();
    router.push(`/track/${data.orderId}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700 text-white mb-3">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Track your order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your order number and the name used when ordering.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order number</label>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-0001"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? "Searching..." : "Track order"}
          </button>
        </form>
      </div>
    </div>
  );
}
