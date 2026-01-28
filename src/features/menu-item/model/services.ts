import { prisma } from "@/shared/db/prisma";
import {
  createMenuItemInput,
  deleteMenuItemInput,
  updateMenuItemInput,
} from "./types";

export const MenuItemService = {
  async create(data: createMenuItemInput) {
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { name: data.name },
    });
    if (existingMenuItem) {
      throw new Error("Позиція меню з такою назвою вже існує");
    }
    return await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable ?? true,
      },
    });
  },

  async update(data: updateMenuItemInput) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: data.id },
    });
    if (!menuItem) {
      throw new Error("Позиція меню не знайдена");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const existingMenuItem = await prisma.menuItem.findUnique({
        where: { name: data.name },
      });
      if (existingMenuItem && existingMenuItem.id !== data.id) {
        throw new Error("Позиція меню з такою назвою вже існує");
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
        throw new Error("Категорія не знайдена");
      }
      updateData.categoryId = data.categoryId;
    }
    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
    }

    return await prisma.menuItem.update({
      where: { id: data.id },
      data: updateData,
    });
  },

  async delete(data: deleteMenuItemInput) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: data.id },
    });
    if (!menuItem) {
      throw new Error("Позиція меню не знайдена");
    }
    await prisma.menuItem.delete({
      where: { id: data.id },
    });
  },
};
