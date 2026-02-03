import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getAllMenuItemsSchema, getMenuItemByIdSchema } from "./schemas";
import {
  getAllMenuItemsInput,
  getMenuItemByIdInput,
  MenuItemInfo,
  MenuItemsList,
} from "./types";

export async function getAllMenuItems(
  data: getAllMenuItemsInput,
): Promise<MenuItemsList> {
  const validated = getAllMenuItemsSchema.parse(data);
  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;
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
    take: limit,
    skip: skip,
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
          description: true,
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
  const total = await prisma.menuItem.count({
    where: filters.length > 0 ? { AND: filters } : undefined,
  });
  const totalPages = Math.ceil(total / limit);

  return {
    items: menuItems.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
    total,
    page,
    totalPages,
  };
}

export async function getMenuItemById(
  data: getMenuItemByIdInput,
): Promise<MenuItemInfo> {
  const validated = getMenuItemByIdSchema.parse(data);
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: validated.id },
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
          description: true,
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
  if (!menuItem) {
    throw new NotFoundError("Menu item not found");
  }
  return {
    ...menuItem,
    price: menuItem.price.toNumber(),
  };
}
