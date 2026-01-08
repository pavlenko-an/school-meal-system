import { prisma } from "@/shared/db/prisma";
import { createMenuItemSchema } from "../model/create-menu-item.schema";
import { deleteMenuItemSchema } from "../model/delete-menu-item.schema";
import { getAllMenuItemsSchema } from "../model/get-all-menu-items.schema";
import { getMenuItemByIdSchema } from "../model/get-menu-item-by-id.schema";
import {
  createMenuItemInput,
  deleteMenuItemInput,
  getAllMenuItemsInput,
  getMenuItemByIdInput,
  updateMenuItemInput,
} from "../model/menu-item.types";
import { updateMenuItemSchema } from "../model/update-menu-item.schema";
import { CurrentUser } from "@/shared/auth/current-user";

export async function getAllMenuItems(input: getAllMenuItemsInput) {
  const data = getAllMenuItemsSchema.parse(input);
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

export async function getMenuItemById(input: getMenuItemByIdInput) {
  const data = getMenuItemByIdSchema.parse(input);
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) {
    throw new Error("Menu item not found");
  }
  return menuItem;
}

export async function createMenuItem(
  input: createMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new Error("Access denied");
  }
  const data = createMenuItemSchema.parse(input);
  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { name: data.name },
  });
  if (existingMenuItem) {
    throw new Error("Menu item with this name already exists");
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
  input: updateMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new Error("Access denied");
  }
  const data = updateMenuItemSchema.parse(input);
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) throw new Error("Menu item not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { name: data.name },
    });
    if (existingMenuItem && existingMenuItem.id !== data.id) {
      throw new Error("Menu item with this name already exists");
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
      throw new Error("Category not found");
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
  input: deleteMenuItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new Error("Access denied");
  }
  const data = deleteMenuItemSchema.parse(input);
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.id },
  });
  if (!menuItem) throw new Error("Menu item not found");
  await prisma.menuItem.delete({
    where: { id: data.id },
  });
}
