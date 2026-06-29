import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/repositories/order-repository";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber")?.trim();
  const customerName = req.nextUrl.searchParams.get("customerName")?.trim();

  if (!orderNumber || !customerName) {
    return NextResponse.json({ error: "orderNumber and customerName required." }, { status: 400 });
  }

  const order = await orderRepository.findByNumberAndName(orderNumber, customerName);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const baseUrl = req.nextUrl.origin;
  return NextResponse.json({ orderId: order.id, trackUrl: `${baseUrl}/track/${order.id}` });
}
