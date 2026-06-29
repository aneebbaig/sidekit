import { PrismaClient, type Prisma } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Sidekit...");

  await prisma.activityLog.deleteMany();
  await prisma.orderPayment.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.costItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.task.deleteMany();
  await prisma.researchNote.deleteMany();
  await prisma.hustle.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "owner@example.com",
      name: "Aneeb",
      passwordHash: await bcrypt.hash("sidekit123", 12),
    },
  });
  console.log("👤 Created owner: owner@example.com / sidekit123");

  const hustle = await prisma.hustle.create({
    data: {
      name: "Resin Hustle",
      color: "#6366f1",
      description: "Custom resin gifts — keepsakes, name plaques, and decor.",
      currency: "PKR",
      status: "LAUNCHED",
    },
  });

  // ─── Research Notes ─────────────────────────────────────────────────
  await prisma.researchNote.createMany({
    data: [
      {
        hustleId: hustle.id,
        title: "Pakistan wedding gifting market sizing",
        content:
          "~3M weddings/year. Avg gift budget per attendee PKR 2K-5K.\nPrimary buyers: bride's family, close cousins, sisters.\nSeasonal peak: Oct-Mar. Plan inventory ramp 6 weeks ahead.",
        category: "MARKET",
        tags: ["weddings", "seasonality"],
        pinned: true,
      },
      {
        hustleId: hustle.id,
        title: "Top resin SKUs by margin",
        content:
          "Couple name plaques: 65% margin\nQuran ayah blocks: 70% margin\nEmployee award sets: 55% margin (B2B)\nKeychain favors: 40% margin (volume).",
        category: "PRICING",
        tags: ["margin", "skus"],
        pinned: true,
      },
      {
        hustleId: hustle.id,
        title: "Resin supplier comparison",
        content:
          "Karachi Crafts Co — fastest delivery, slightly higher price.\nLahore Resin Hub — best price for large orders.\nAvoid Daraz resellers, quality inconsistent.",
        category: "SUPPLIER",
        tags: ["raw-material"],
      },
      {
        hustleId: hustle.id,
        title: "Competitor: ResinByZee on Instagram",
        content:
          "30K followers. Prices: PKR 1500-7000.\nWeakness: 7-10 day turnaround.\nStrength: aesthetic photography.\nOpportunity: faster turnaround + custom calligraphy.",
        category: "COMPETITOR",
        tags: ["instagram"],
      },
      {
        hustleId: hustle.id,
        title: "Pak tax registration thresholds",
        content:
          "Sole proprietor under PKR 600K/year exempt.\nIncome tax filing required annually.\nGST registration triggered at PKR 8M turnover.",
        category: "LEGAL",
        tags: ["tax"],
      },
      {
        hustleId: hustle.id,
        title: "Customer feedback log",
        content:
          "Aisha (Lahore): loved finish, packaging could be premium.\nBilal (Karachi): wanted faster delivery.\nDecision: invest in better packaging + same-city express option.",
        category: "CUSTOMER",
        tags: ["feedback"],
      },
      {
        hustleId: hustle.id,
        title: "Curing time optimization",
        content:
          "Reduced from 36h to 22h by using fast-cure resin in summer.\nMonitor bubble formation in humid days.",
        category: "OPERATIONS",
        tags: ["production"],
      },
    ],
  });

  // ─── Suppliers ──────────────────────────────────────────────────────
  const karachi = await prisma.supplier.create({
    data: {
      hustleId: hustle.id,
      name: "Karachi Crafts Co",
      contactName: "Ahmed Raza",
      phone: "+92 300 1234567",
      email: "orders@karachicrafts.pk",
      website: "https://karachicrafts.pk",
      city: "Karachi",
      rating: 5,
      preferred: true,
      notes: "Fast delivery, premium resin. Goto vendor.",
    },
  });
  const lahore = await prisma.supplier.create({
    data: {
      hustleId: hustle.id,
      name: "Lahore Resin Hub",
      contactName: "Sana Iqbal",
      phone: "+92 333 9876543",
      email: "hello@lahoreresin.pk",
      city: "Lahore",
      rating: 4,
      preferred: false,
      notes: "Best for bulk. Higher MOQ.",
    },
  });

  // ─── Cost items ─────────────────────────────────────────────────────
  await prisma.costItem.createMany({
    data: [
      {
        hustleId: hustle.id,
        supplierId: karachi.id,
        name: "Epoxy resin (1kg)",
        category: "RAW_MATERIAL",
        type: "VARIABLE",
        amount: 2200,
        unit: "kg",
        quantity: 0.15,
        notes: "Per typical plaque ~150g",
      },
      {
        hustleId: hustle.id,
        supplierId: karachi.id,
        name: "Hardener",
        category: "RAW_MATERIAL",
        type: "VARIABLE",
        amount: 900,
        unit: "kg",
        quantity: 0.075,
      },
      {
        hustleId: hustle.id,
        supplierId: lahore.id,
        name: "Pigment set",
        category: "RAW_MATERIAL",
        type: "VARIABLE",
        amount: 80,
        unit: "g",
        quantity: 5,
      },
      {
        hustleId: hustle.id,
        name: "Gift box + ribbon",
        category: "PACKAGING",
        type: "VARIABLE",
        amount: 250,
        unit: "set",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Branded sticker",
        category: "PACKAGING",
        type: "VARIABLE",
        amount: 30,
        unit: "piece",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Silicone molds (amortized)",
        category: "EQUIPMENT",
        type: "FIXED",
        amount: 12000,
        unit: "set",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Studio rent",
        category: "MISCELLANEOUS",
        type: "FIXED",
        amount: 25000,
        unit: "month",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Instagram ads",
        category: "MARKETING",
        type: "FIXED",
        amount: 8000,
        unit: "month",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Courier (TCS)",
        category: "SHIPPING",
        type: "VARIABLE",
        amount: 350,
        unit: "parcel",
        quantity: 1,
      },
      {
        hustleId: hustle.id,
        name: "Daraz commission",
        category: "PLATFORM_FEE",
        type: "VARIABLE",
        amount: 150,
        unit: "order",
        quantity: 1,
      },
    ],
  });

  // ─── Inventory ──────────────────────────────────────────────────────
  await prisma.inventoryItem.createMany({
    data: [
      {
        hustleId: hustle.id,
        name: "Epoxy resin",
        sku: "RAW-RESIN-1KG",
        unit: "kg",
        quantity: 3.5,
        reorderAt: 2,
        unitCost: 2200,
      },
      {
        hustleId: hustle.id,
        name: "Hardener",
        sku: "RAW-HARD-500G",
        unit: "kg",
        quantity: 0.8,
        reorderAt: 1,
        unitCost: 900,
      },
      {
        hustleId: hustle.id,
        name: "Gold pigment",
        sku: "PIG-GOLD",
        unit: "g",
        quantity: 200,
        reorderAt: 50,
        unitCost: 80,
      },
      {
        hustleId: hustle.id,
        name: "Premium gift boxes",
        sku: "PKG-BOX-MD",
        unit: "piece",
        quantity: 18,
        reorderAt: 20,
        unitCost: 220,
      },
      {
        hustleId: hustle.id,
        name: "Brand stickers",
        sku: "PKG-STK",
        unit: "piece",
        quantity: 350,
        reorderAt: 100,
        unitCost: 30,
      },
      {
        hustleId: hustle.id,
        name: "Couple plaque mold",
        sku: "MLD-CPL",
        unit: "piece",
        quantity: 2,
        reorderAt: 1,
        unitCost: 6000,
      },
    ],
  });

  // ─── Customers ──────────────────────────────────────────────────────
  const aisha = await prisma.customer.create({
    data: {
      hustleId: hustle.id,
      name: "Aisha Khan",
      phone: "+92 321 2233445",
      email: "aisha.k@example.com",
      city: "Lahore",
      address: "DHA Phase 5, Lahore",
      source: "Instagram",
      notes: "Prefers gold accents. Repeat customer.",
    },
  });
  const bilal = await prisma.customer.create({
    data: {
      hustleId: hustle.id,
      name: "Bilal Ahmed",
      phone: "+92 345 7788990",
      email: "bilal.a@example.com",
      city: "Karachi",
      address: "Clifton Block 4, Karachi",
      source: "Referral",
      notes: "Corporate gifting account at his firm.",
    },
  });

  // ─── Orders ─────────────────────────────────────────────────────────
  const now = new Date();
  function daysAgo(d: number) {
    return new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  }
  function daysFromNow(d: number) {
    return new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  }

  const orderSeeds: Array<{
    orderNumber: string;
    customer?: typeof aisha;
    customerName: string;
    status: Prisma.OrderCreateInput["status"];
    paymentStatus: Prisma.OrderCreateInput["paymentStatus"];
    paymentMethod: Prisma.OrderCreateInput["paymentMethod"];
    shippingCost: number;
    discount: number;
    total: number;
    amountPaid: number;
    customizations: Record<string, string>;
    notes?: string;
    dueDate?: Date;
    createdAt: Date;
    items: { name: string; description?: string; quantity: number; unitPrice: number }[];
  }> = [
    {
      orderNumber: "ORD-0001",
      customer: aisha,
      customerName: "Aisha Khan",
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "BANK_TRANSFER",
      shippingCost: 350,
      discount: 0,
      total: 3850,
      amountPaid: 3850,
      customizations: { Names: "Aisha & Bilal", Design: "Golden Vow", Date: "12-04-2026" },
      notes: "Anniversary gift. Express shipping.",
      dueDate: daysAgo(35),
      createdAt: daysAgo(45),
      items: [
        { name: "Couple Name Plaque", description: "8x10 inch, gold pigment", quantity: 1, unitPrice: 3500 },
      ],
    },
    {
      orderNumber: "ORD-0002",
      customer: bilal,
      customerName: "Bilal Ahmed",
      status: "IN_PRODUCTION",
      paymentStatus: "PARTIAL",
      paymentMethod: "EASYPAISA",
      shippingCost: 350,
      discount: 500,
      total: 14850,
      amountPaid: 7000,
      customizations: { "Company logo": "Lumen Tech", "Quantity per set": "5" },
      notes: "Corporate gifting batch for HR award ceremony.",
      dueDate: daysFromNow(10),
      createdAt: daysAgo(8),
      items: [
        { name: "Employee Award Block", description: "Engraved name + crest", quantity: 5, unitPrice: 3000 },
      ],
    },
    {
      orderNumber: "ORD-0003",
      customerName: "Walk-in (Tariq)",
      status: "PENDING",
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      shippingCost: 0,
      discount: 0,
      total: 1800,
      amountPaid: 0,
      customizations: { Ayah: "Ayat-ul-Kursi", Frame: "Walnut" },
      dueDate: daysFromNow(5),
      createdAt: daysAgo(2),
      items: [{ name: "Quran Ayah Block", quantity: 1, unitPrice: 1800 }],
    },
    {
      orderNumber: "ORD-0004",
      customer: aisha,
      customerName: "Aisha Khan",
      status: "READY",
      paymentStatus: "PAID",
      paymentMethod: "CARD",
      shippingCost: 350,
      discount: 0,
      total: 4350,
      amountPaid: 4350,
      customizations: { Names: "Hina & Ahmed", Color: "Rose Gold" },
      dueDate: daysFromNow(1),
      createdAt: daysAgo(6),
      items: [{ name: "Couple Name Plaque", quantity: 1, unitPrice: 4000 }],
    },
    {
      orderNumber: "ORD-0005",
      customerName: "Hina Naveed",
      status: "SHIPPED",
      paymentStatus: "PAID",
      paymentMethod: "JAZZCASH",
      shippingCost: 350,
      discount: 100,
      total: 1750,
      amountPaid: 1750,
      customizations: { Theme: "Floral", Size: "Small" },
      createdAt: daysAgo(3),
      items: [{ name: "Keychain Favor x10", description: "Wedding favor set", quantity: 10, unitPrice: 150 }],
    },
    {
      orderNumber: "ORD-0006",
      customerName: "Returning client",
      status: "CANCELLED",
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      shippingCost: 0,
      discount: 0,
      total: 2000,
      amountPaid: 0,
      customizations: {},
      notes: "Customer changed mind same day. No production cost incurred.",
      createdAt: daysAgo(12),
      items: [{ name: "Custom Coaster Set", quantity: 1, unitPrice: 2000 }],
    },
  ];

  for (const o of orderSeeds) {
    await prisma.order.create({
      data: {
        hustleId: hustle.id,
        customerId: o.customer?.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        shippingCost: o.shippingCost,
        discount: o.discount,
        total: o.total,
        amountPaid: o.amountPaid,
        customizations: o.customizations,
        notes: o.notes,
        dueDate: o.dueDate,
        createdAt: o.createdAt,
        items: { create: o.items.map((i) => ({ ...i })) },
        events: {
          create: [{ status: "PENDING", note: "Order received" }],
        },
        payments:
          o.amountPaid > 0
            ? { create: [{ amount: o.amountPaid, method: o.paymentMethod ?? "CASH" }] }
            : undefined,
      },
    });
  }

  // ─── Transactions ──────────────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      {
        hustleId: hustle.id,
        type: "INCOME",
        category: "Order Sale",
        description: "ORD-0001 Aisha Khan",
        amount: 3850,
        date: daysAgo(45),
      },
      {
        hustleId: hustle.id,
        type: "INCOME",
        category: "Order Sale",
        description: "ORD-0004 Aisha Khan",
        amount: 4350,
        date: daysAgo(5),
      },
      {
        hustleId: hustle.id,
        type: "INCOME",
        category: "Order Sale",
        description: "ORD-0005 Hina Naveed",
        amount: 1750,
        date: daysAgo(3),
      },
      {
        hustleId: hustle.id,
        type: "INCOME",
        category: "Order Sale",
        description: "ORD-0002 partial",
        amount: 7000,
        date: daysAgo(8),
      },
      {
        hustleId: hustle.id,
        type: "EXPENSE",
        category: "Materials",
        description: "Resin restock",
        amount: 22000,
        date: daysAgo(40),
      },
      {
        hustleId: hustle.id,
        type: "EXPENSE",
        category: "Packaging",
        description: "Premium gift boxes batch",
        amount: 5500,
        date: daysAgo(20),
      },
      {
        hustleId: hustle.id,
        type: "EXPENSE",
        category: "Marketing",
        description: "Instagram ads",
        amount: 8000,
        date: daysAgo(7),
      },
      {
        hustleId: hustle.id,
        type: "EXPENSE",
        category: "Utilities",
        description: "Studio rent",
        amount: 25000,
        date: daysAgo(15),
      },
      {
        hustleId: hustle.id,
        type: "EXPENSE",
        category: "Shipping",
        description: "TCS courier batch",
        amount: 1750,
        date: daysAgo(4),
      },
    ],
  });

  // ─── Tasks (launch checklist) ──────────────────────────────────────
  await prisma.task.createMany({
    data: [
      {
        hustleId: hustle.id,
        title: "Restock gift boxes (below reorder point)",
        description: "Order 50 more premium gift boxes from local printer.",
        priority: "HIGH",
        status: "TODO",
        category: "Operations",
        dueDate: daysFromNow(2),
      },
      {
        hustleId: hustle.id,
        title: "Photograph 5 new SKUs for Instagram",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        category: "Marketing",
        dueDate: daysFromNow(5),
      },
      {
        hustleId: hustle.id,
        title: "Quarterly cost sheet review",
        description: "Reassess all variable costs.",
        priority: "MEDIUM",
        status: "TODO",
        category: "Finance",
        dueDate: daysFromNow(14),
      },
      {
        hustleId: hustle.id,
        title: "Hire part-time packer for wedding season",
        priority: "HIGH",
        status: "TODO",
        category: "HR",
        dueDate: daysFromNow(21),
      },
      {
        hustleId: hustle.id,
        title: "Settle Bilal corporate partial payment",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        category: "Finance",
        dueDate: daysAgo(1),
      },
      {
        hustleId: hustle.id,
        title: "Open registration for tax filing",
        priority: "LOW",
        status: "DONE",
        category: "Legal",
      },
      {
        hustleId: hustle.id,
        title: "Negotiate bulk pricing with Lahore Resin Hub",
        priority: "MEDIUM",
        status: "TODO",
        category: "Operations",
        dueDate: daysFromNow(7),
      },
    ],
  });

  // ─── Activity log seed ─────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      hustleId: hustle.id,
      type: "HUSTLE_CREATED",
      title: `Hustle "${hustle.name}" created`,
      refId: hustle.id,
      createdAt: daysAgo(60),
    },
  });

  console.log("✅ Seed complete. Run pnpm dev and sign in with owner@example.com / sidekit123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
