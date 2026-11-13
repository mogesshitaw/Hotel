import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { createProduct, updateProduct, deleteProduct, setProductState } from "../actions";
import { ProductsManagerClient } from "@/components/ProductsManagerClient";

export const dynamic = "force-dynamic";

export default async function Products() {
  const { restaurant } = await getRestaurantContext();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameAm: true,
        sortOrder: true,
      },
    }),
    prisma.product.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAm: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Convert Decimal prices to plain numbers for clean Client Component passing
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    nameAm: p.nameAm,
    description: p.description,
    descriptionAm: p.descriptionAm,
    price: Number(p.price),
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    isActive: p.isActive,
    categoryId: p.categoryId,
    category: p.category,
  }));

  return (
    <ProductsManagerClient
      products={serializedProducts}
      categories={categories}
      currency={restaurant.currency}
      createAction={createProduct}
      updateAction={updateProduct}
      deleteAction={deleteProduct}
      setStateAction={setProductState}
    />
  );
}
