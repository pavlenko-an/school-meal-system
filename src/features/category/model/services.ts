import { ConflictError } from "@/shared/errors/conflict.error";
import {
  createCategoryInput,
  deleteCategoryInput,
  updateCategoryInput,
} from "./types";
import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";

export const CategoryService = {
  async create(data: createCategoryInput) {
    const existsingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existsingCategory) {
      throw new ConflictError("Категорія з такою назвою вже існує");
    }
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });
  },

  async update(data: updateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id: data.id },
    });
    if (!category) throw new NotFoundError("Категорія не знайдена");

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });
      if (existingCategory && existingCategory.id !== data.id) {
        throw new ConflictError("Категорія з такою назвою вже існує");
      }
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    return prisma.category.update({
      where: { id: data.id },
      data: updateData,
    });
  },

  async delete(data: deleteCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id: data.id },
    });
    if (!category) throw new NotFoundError("Категорія не знайдена");
    await prisma.category.delete({
      where: { id: data.id },
    });
  },
};
