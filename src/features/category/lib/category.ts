import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  createCategoryInput,
  deleteCategoryInput,
  getAllCategoriesInput,
  getCategoryByIdInput,
  updateCategoryInput,
} from "../model/category.types";
import { CurrentUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllCategories(data: getAllCategoriesInput) {
  const filters: Prisma.CategoryWhereInput[] = [];
  if (data.name) {
    filters.push({ name: { contains: data.name, mode: "insensitive" } });
  }
  const categories = await prisma.category.findMany({
    where: {
      AND: filters.length > 0 ? filters : undefined,
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  return categories;
}

export async function getCategoryById(data: getCategoryByIdInput) {
  const category = await prisma.category.findUnique({
    where: { id: data.id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

export async function createCategory(
  data: createCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const existsingCategory = await prisma.category.findUnique({
    where: { name: data.name },
  });
  if (existsingCategory) {
    throw new ConflictError("Category with this name already exists");
  }
  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
  return category;
}

export async function updateCategory(
  data: updateCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }

  const category = await prisma.category.findUnique({
    where: { id: data.id },
  });
  if (!category) throw new NotFoundError("Category not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existingCategory && existingCategory.id !== data.id) {
      throw new ConflictError("Category with this name already exists");
    }
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }

  const updatedCategory = await prisma.category.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedCategory;
}

export async function deleteCategory(
  data: deleteCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const category = await prisma.category.findUnique({
    where: { id: data.id },
  });
  if (!category) throw new NotFoundError("Category not found");
  await prisma.category.delete({
    where: { id: data.id },
  });
}
