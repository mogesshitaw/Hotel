import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const USER_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  const user = await prisma.user.upsert({
    where: { id: USER_ID }, update: {},
    create: { id: USER_ID, name: "Demo Owner", email: "owner@example.com" },
  });
  const r = await prisma.restaurant.upsert({
    where: { slug: "fre-bar" }, update: {},
    create: { name: "Fre Bar & Restaurant", nameAm: "ፍሬ ባር እና ሬስቶራንት", slug: "fre-bar",
      description: "Food, drinks and good company.", phone: "+251900000000" },
  });
  await prisma.membership.upsert({
    where: { restaurantId_userId: { restaurantId: r.id, userId: user.id } }, update: {},
    create: { restaurantId: r.id, userId: user.id, role: "OWNER" },
  });

  // Seed staff roles for Role-Based Authentication demonstration
  const staffAccounts = [
    { id: "00000000-0000-4000-8000-000000000002", email: "manager@example.com", name: "Sara Manager", role: "MANAGER" as const },
    { id: "00000000-0000-4000-8000-000000000003", email: "cashier@example.com", name: "Abebe Cashier", role: "CASHIER" as const },
    { id: "00000000-0000-4000-8000-000000000004", email: "kitchen@example.com", name: "Chef Almaz", role: "KITCHEN" as const },
    { id: "00000000-0000-4000-8000-000000000005", email: "waiter@example.com", name: "Dawit Waiter", role: "WAITER" as const },
  ];

  for (const staff of staffAccounts) {
    const sUser = await prisma.user.upsert({
      where: { id: staff.id },
      update: {},
      create: { id: staff.id, name: staff.name, email: staff.email },
    });
    await prisma.membership.upsert({
      where: { restaurantId_userId: { restaurantId: r.id, userId: sUser.id } },
      update: { role: staff.role },
      create: { restaurantId: r.id, userId: sUser.id, role: staff.role },
    });
  }

  // Super Admin Account
  await prisma.adminUser.upsert({
    where: { email: "admin@saas.com" },
    update: {},
    create: {
      email: "admin@saas.com",
      name: "Platform Super Admin",
    },
  });
  const food = await prisma.category.upsert({
    where: { restaurantId_name: { restaurantId: r.id, name: "Food" } }, update: {},
    create: { restaurantId: r.id, name: "Food", nameAm: "ምግቦች", sortOrder: 1 },
  });
  const drinks = await prisma.category.upsert({
    where: { restaurantId_name: { restaurantId: r.id, name: "Drinks" } }, update: {},
    create: { restaurantId: r.id, name: "Drinks", nameAm: "መጠጦች", sortOrder: 2 },
  });
  if ((await prisma.product.count({ where: { restaurantId: r.id } })) === 0) {
    await prisma.product.createMany({ data: [
      { restaurantId: r.id, categoryId: food.id, name: "Double Beef Burger", nameAm: "ድርብ የበሬ በርገር", description: "Juicy double patties with melted cheese and house sauce", price: 320, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" },
      { restaurantId: r.id, categoryId: food.id, name: "Poke Salad Bowl", nameAm: "ፖክ ሳላድ", description: "Fresh seasonal veggies, greens and dressing", price: 280, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80" },
      { restaurantId: r.id, categoryId: food.id, name: "Special Kitfo", nameAm: "ልዩ ክትፎ", description: "Minced lean beef seasoned in mitmita and niter kibbeh", price: 450, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" },
      { restaurantId: r.id, categoryId: food.id, name: "Doro Wat", nameAm: "ዶሮ ወጥ", description: "Spicy chicken stew with hard-boiled egg", price: 380, imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80" },
      { restaurantId: r.id, categoryId: drinks.id, name: "Fresh Lemon Tea", nameAm: "የሎሚ ሻይ", description: "Chilled brewed tea with fresh organic lemons", price: 60, imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80" },
      { restaurantId: r.id, categoryId: drinks.id, name: "Ethiopian Roast Coffee", nameAm: "የተቆላ ቡና", description: "Traditional freshly ground ceremony coffee", price: 45, imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80" },
    ] });
  }

  // Seed Level 2 Tables (Table 20 matches the Level 2 reference photo!)
  const tables = [
    { tableNumber: "20", qrToken: "tbl-fre-20", capacity: 4 },
    { tableNumber: "01", qrToken: "tbl-fre-01", capacity: 2 },
    { tableNumber: "02", qrToken: "tbl-fre-02", capacity: 6 },
  ];

  for (const t of tables) {
    await prisma.restaurantTable.upsert({
      where: { qrToken: t.qrToken },
      update: {},
      create: {
        restaurantId: r.id,
        tableNumber: t.tableNumber,
        qrToken: t.qrToken,
        capacity: t.capacity,
      },
    });
  }
  // ─── Level 4: Seed ERP Data ────────────────────────────────────────────────
  const ingredients = [
    { name: "Beef", nameAm: "የበሬ ሥጋ", unit: "kg", costPerUnit: 650, minimumStock: 5 },
    { name: "Coffee Beans", nameAm: "ቡና", unit: "kg", costPerUnit: 320, minimumStock: 2 },
    { name: "Injera Flour (Teff)", nameAm: "ጤፍ", unit: "kg", costPerUnit: 85, minimumStock: 10 },
    { name: "Chicken", nameAm: "ዶሮ", unit: "kg", costPerUnit: 380, minimumStock: 3 },
    { name: "Tomatoes", nameAm: "ቲማቲም", unit: "kg", costPerUnit: 45, minimumStock: 5 },
  ];

  const ingMap: Record<string, string> = {};
  for (const ing of ingredients) {
    const existing = await prisma.ingredient.findFirst({ where: { restaurantId: r.id, name: ing.name } });
    if (existing) {
      ingMap[ing.name] = existing.id;
    } else {
      const created = await prisma.ingredient.create({
        data: { restaurantId: r.id, ...ing },
      });
      ingMap[ing.name] = created.id;
      await prisma.inventory.create({
        data: { restaurantId: r.id, ingredientId: created.id, quantity: 0 },
      });
    }
  }

  // Add initial stock
  const initialStock: Record<string, number> = {
    "Beef": 12,
    "Coffee Beans": 8,
    "Injera Flour (Teff)": 25,
    "Chicken": 10,
    "Tomatoes": 15,
  };
  for (const [name, qty] of Object.entries(initialStock)) {
    const inv = await prisma.inventory.findFirst({ where: { restaurantId: r.id, ingredientId: ingMap[name] } });
    if (inv && Number(inv.quantity) === 0) {
      await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: qty } });
    }
  }

  // Add supplier
  let supplier = await prisma.supplier.findFirst({ where: { restaurantId: r.id, name: "ፍሬ ትኩስ ምርቶች" } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        restaurantId: r.id,
        name: "ፍሬ ትኩስ ምርቶች",
        phone: "+251911234567",
        address: "Addis Ababa, Bole",
      },
    });
  }

  // Add sample purchase order
  const poCount = await prisma.purchaseOrder.count({ where: { restaurantId: r.id } });
  if (poCount === 0) {
    await prisma.purchaseOrder.create({
      data: {
        restaurantId: r.id,
        supplierId: supplier.id,
        status: "RECEIVED",
        deliveryDate: new Date(Date.now() - 2 * 86400000),
        total: 12 * 650 + 8 * 320,
        items: {
          create: [
            { ingredientId: ingMap["Beef"], quantity: 12, unitCost: 650, totalCost: 12 * 650 },
            { ingredientId: ingMap["Coffee Beans"], quantity: 8, unitCost: 320, totalCost: 8 * 320 },
          ],
        },
      },
    });
    // A pending order
    await prisma.purchaseOrder.create({
      data: {
        restaurantId: r.id,
        supplierId: supplier.id,
        status: "ORDERED",
        deliveryDate: new Date(Date.now() + 2 * 86400000),
        total: 25 * 85 + 15 * 45,
        items: {
          create: [
            { ingredientId: ingMap["Injera Flour (Teff)"], quantity: 25, unitCost: 85, totalCost: 25 * 85 },
            { ingredientId: ingMap["Tomatoes"], quantity: 15, unitCost: 45, totalCost: 15 * 45 },
          ],
        },
      },
    });
  }

  // Add sample expenses
  const expCount = await prisma.expense.count({ where: { restaurantId: r.id } });
  if (expCount === 0) {
    await prisma.expense.createMany({
      data: [
        { restaurantId: r.id, category: "RENT", description: "Monthly Rent - Main Hall", amount: 15000, date: new Date() },
        { restaurantId: r.id, category: "UTILITIES", description: "Electricity Bill - October", amount: 3200, date: new Date() },
        { restaurantId: r.id, category: "PAYROLL", description: "Staff Salaries - October", amount: 28000, date: new Date() },
        { restaurantId: r.id, category: "SUPPLIES", description: "Cleaning supplies & napkins", amount: 1800, date: new Date() },
      ],
    });
  }

  // ─── Level 5: Enterprise SaaS Seed Data ─────────────────────────────────────
  // 1. Subscription Plans
  const starterPlan = await prisma.plan.upsert({
    where: { name: "Starter" },
    update: {},
    create: {
      name: "Starter",
      tier: "BASIC",
      priceMonthly: 1200,
      priceYearly: 12000,
      maxBranches: 1,
      maxUsers: 3,
      maxProducts: 50,
      hasKDS: false,
      hasPOS: false,
      hasERP: false,
      hasAPI: false,
      description: "Digital QR Menu and basic order taking for cafes & small bars.",
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: "Professional" },
    update: {},
    create: {
      name: "Professional",
      tier: "PREMIUM",
      priceMonthly: 3500,
      priceYearly: 35000,
      maxBranches: 3,
      maxUsers: 15,
      maxProducts: 300,
      hasKDS: true,
      hasPOS: true,
      hasERP: true,
      hasAPI: true,
      description: "Full end-to-end POS, KDS, inventory ERP, and payment processing.",
    },
  });

  // 2. Assign Pro plan and Subscription to flagship restaurant
  await prisma.restaurant.update({
    where: { id: r.id },
    data: { planId: proPlan.id },
  });

  const existingSub = await prisma.subscription.findUnique({ where: { restaurantId: r.id } });
  if (!existingSub) {
    const sub = await prisma.subscription.create({
      data: {
        restaurantId: r.id,
        planId: proPlan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
    });

    await prisma.invoice.create({
      data: {
        subscriptionId: sub.id,
        amount: 3500,
        currency: "ETB",
        status: "ACTIVE",
        dueDate: new Date(Date.now() + 15 * 86400000),
        paidAt: new Date(),
      },
    });
  }

  // 3. Multi-branch locations
  const branchCount = await prisma.branch.count({ where: { restaurantId: r.id } });
  if (branchCount === 0) {
    await prisma.branch.createMany({
      data: [
        {
          restaurantId: r.id,
          name: "Bole Medhanialem (HQ)",
          nameAm: "ቦሌ መድኃኔዓለም (ዋና ቅርንጫፍ)",
          address: "Bole Road, Camrose Building 1st Floor",
          phone: "+251911000001",
          isHQ: true,
        },
        {
          restaurantId: r.id,
          name: "Kazanchis Branch",
          nameAm: "ካዛንቺስ ቅርንጫፍ",
          address: "Kazanchis, Near UNECA",
          phone: "+251911000002",
          isHQ: false,
        },
      ],
    });
  }

  // 4. Sample Gateway Transactions (Telebirr & Chapa)
  const txCount = await prisma.gatewayTransaction.count();
  if (txCount === 0) {
    await prisma.gatewayTransaction.createMany({
      data: [
        {
          provider: "TELEBIRR",
          status: "SUCCESS",
          amount: 3500,
          currency: "ETB",
          reference: "TLB-9948201",
          phone: "+251911223344",
        },
        {
          provider: "CHAPA",
          status: "SUCCESS",
          amount: 450,
          currency: "ETB",
          reference: "CHP-103984",
          phone: "+251922334455",
        },
        {
          provider: "CBE_BIRR",
          status: "PENDING",
          amount: 1200,
          currency: "ETB",
          reference: "CBE-887412",
          phone: "+251933445566",
        },
      ],
    });
  }

  // 5. Initial Audit Logs
  const auditCount = await prisma.auditLog.count();
  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          restaurantId: r.id,
          action: "CREATE",
          entity: "Restaurant",
          entityId: r.id,
          description: "Flagship tenant Fre Bar & Restaurant initialized with bilingual catalog",
        },
        {
          restaurantId: r.id,
          action: "SUBSCRIPTION_CHANGE",
          entity: "Subscription",
          entityId: r.id,
          description: "Subscribed to Professional Tier (ETB 3,500/month)",
        },
      ],
    });
  }

  console.log("✅ Seeded Level 1–5. Menu: /menu/fre-bar | Dashboard: /dashboard | Super Admin: /admin");
}
main().finally(() => prisma.$disconnect());
