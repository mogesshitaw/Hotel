import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FOOD_IMAGES: Record<string, string> = {
  Kitfo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "Special Kitfo": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  "Doro Wat": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
  Tea: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
  "Fresh Lemon Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
  Coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
  "Ethiopian Roast Coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
  "Double Beef Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  "Poke Salad Bowl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
};

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    const url =
      FOOD_IMAGES[p.name] ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
    await prisma.product.update({
      where: { id: p.id },
      data: { imageUrl: url },
    });
    console.log(`Updated image for: ${p.name}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

