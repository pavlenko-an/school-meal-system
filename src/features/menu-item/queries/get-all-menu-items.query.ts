import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getAllMenuItemsSchema } from "../model/get-all-menu-items.schema";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getAllMenuItemsInput, MenuItemInfo } from "../model/menu-item.types";

export async function getAllMenuItems(
  data: getAllMenuItemsInput,
): Promise<MenuItemInfo[]> {
  const validated = getAllMenuItemsSchema.parse(data);
  const existingCategory = validated.categoryId
    ? await prisma.category.findUnique({
        where: { id: validated.categoryId },
      })
    : null;
  if (validated.categoryId && !existingCategory) {
    throw new NotFoundError("Category not found");
  }

  const filters: Prisma.MenuItemWhereInput[] = [];
  if (validated.categoryId) {
    filters.push({ categoryId: validated.categoryId });
  }
  if (validated.name) {
    filters.push({ name: { contains: validated.name, mode: "insensitive" } });
  }
  if (validated.isAvailable !== undefined) {
    filters.push({ isAvailable: validated.isAvailable });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    take: validated.limit ?? 20,
    skip: validated.offset ?? 0,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      isAvailable: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          isPrimary: true,
        },
      },
    },
  });
  return menuItems.map((item) => ({
    ...item,
    price: item.price.toNumber(),
  }));
}
