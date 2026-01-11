import { prisma } from "@/shared/db/prisma";
import {
  createMenuItemInput,
  deleteMenuItemInput,
  getAllMenuItemsInput,
  getMenuItemByIdInput,
  updateMenuItemInput,
} from "../model/menu-item.types";
import { CurrentUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllMenuItems(data: getAllMenuItemsInput) {
  const existingCategory = data.categoryId
    ? await prisma.category.findUnique({
        where: { id: data.categoryId },
      })
    : null;
  if (data.categoryId && !existingCategory) {
    throw new NotFoundError("Category not found");
  }
  const menuItems = await prisma.menuItem.findMany({
    where: {
      AND: [
        data.categoryId ? { categoryId: data.categoryId } : undefined,
        data.name
          ? { name: { contains: data.name, mode: "insensitive" } }
          : undefined,
        data.isAvailable !== undefined
          ? { isAvailable: data.isAvailable }
          : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return menuItems;
}

export async function getMenuItemById(data: getMenuItemByIdInput) {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) {
    throw new NotFoundError("Menu item not found");
  }
  return menuItem;
}

export async function createMenuItem(
  data: createMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { name: data.name },
  });
  if (existingMenuItem) {
    throw new ConflictError("Menu item with this name already exists");
  }
  const menuItem = await prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description || null,
      price: data.price,
      categoryId: data.categoryId,
      isAvailable: data.isAvailable ?? true,
    },
  });
  return menuItem;
}

export async function updateMenuItem(
  data: updateMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) throw new NotFoundError("Menu item not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { name: data.name },
    });
    if (existingMenuItem && existingMenuItem.id !== data.id) {
      throw new ConflictError("Menu item with this name already exists");
    }
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }
  if (data.price !== undefined) {
    updateData.price = data.price;
  }
  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    updateData.categoryId = data.categoryId;
  }
  if (data.isAvailable !== undefined) {
    updateData.isAvailable = data.isAvailable;
  }

  const updatedMenuItem = await prisma.menuItem.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedMenuItem;
}

export async function deleteMenuItem(
  data: deleteMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) throw new NotFoundError("Menu item not found");
  await prisma.menuItem.delete({
    where: { id: data.id },
  });
}
