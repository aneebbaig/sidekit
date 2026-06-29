import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hustleRepository } from "@/repositories/hustle-repository";
import { orderService } from "@/services/order-service";

const bodySchema = z.object({
  customerName: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        quantity: z.coerce.number().int().positive().default(1),
        unitPrice: z.coerce.number().nonnegative(),
      }),
    )
    .min(1),
  shippingCost: z.coerce.number().nonnegative().default(0),
  discount: z.coerce.number().nonnegative().default(0),
  amountPaid: z.coerce.number().nonnegative().default(0),
  paymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
  dueDate: z.string().optional(),
  customizations: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header." }, { status: 401 });
  }

  const hustle = await hustleRepository.findByApiKey(apiKey);
  if (!hustle) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const d = parsed.data;
  const result = await orderService.create(hustle.id, {
    customerName: d.customerName,
    customerId: "",
    status: "PENDING",
    paymentMethod: d.paymentMethod ?? "",
    shippingCost: d.shippingCost,
    discount: d.discount,
    amountPaid: d.amountPaid,
    notes: d.notes ?? "",
    dueDate: d.dueDate ?? "",
    items: d.items,
    customizations: d.customizations
      ? Object.entries(d.customizations).map(([key, value]) => ({ key, value }))
      : [],
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const baseUrl = req.nextUrl.origin;
  return NextResponse.json(
    {
      orderId: result.data.id,
      trackUrl: `${baseUrl}/track/${result.data.id}`,
    },
    { status: 201 },
  );
}
