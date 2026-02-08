import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getAllMenuItemsSchema, getMenuItemByIdSchema } from "./schemas";
import {
  getAllMenuItemsInput,
  getMenuItemByIdInput,
  MenuItemInfo,
  MenuItemsList,
} from "./types";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

export async function getAllMenuItems(
  data: getAllMenuItemsInput,
): Promise<MenuItemsList> {
  const validated = getAllMenuItemsSchema.parse(data);

  const cacheKeyParts = [
    "menu-items",
    validated.categoryId ?? "no-category",
    validated.name ?? "no-name",
    validated.isAvailable !== undefined
      ? String(validated.isAvailable)
      : "no-availability",
    validated.page ? String(validated.page) : "1",
    validated.limit ? String(validated.limit) : "10",
  ];

  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД`,
      );

      const page = validated.page && validated.page > 0 ? validated.page : 1;
      const limit =
        validated.limit && validated.limit > 0 ? validated.limit : 10;
      const skip = (page - 1) * limit;
      const existingCategory = validated.categoryId
        ? await prisma.category.findUnique({
            where: { id: validated.categoryId },
          })
        : null;
      if (validated.categoryId && !existingCategory) {
        notFound();
      }

      const filters: Prisma.MenuItemWhereInput[] = [];
      if (validated.categoryId) {
        filters.push({ categoryId: validated.categoryId });
      }
      if (validated.name) {
        filters.push({
          name: { contains: validated.name, mode: "insensitive" },
        });
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
          imageUrl: true,
          category: {
            select: {
              id: true,
              name: true,
              description: true,
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
    },
    cacheKeyParts,
    {
      revalidate: 300,
      tags: ["menu-items"],
    },
  )();
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
      imageUrl: true,
      category: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
  if (!menuItem) {
    notFound();
  }
  return {
    ...menuItem,
    price: menuItem.price.toNumber(),
  };
}
