import { prisma } from "@/shared/db/prisma";
import {
  createCategoryInput,
  deleteCategoryInput,
  getAllCategoriesInput,
  getCategoryByIdInput,
  updateCategoryInput,
} from "../model/category.types";
import { createCategorySchema } from "../model/create-category.schema";
import { deleteCategorySchema } from "../model/delete-category.schema";
import { getAllCategoriesSchema } from "../model/get-all-categories.schema";
import { getCategoryByIdSchema } from "../model/get-category-by-id.schema";
import { updateCategorySchema } from "../model/update-category.schema";
import { CurrentUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllCategories(input: getAllCategoriesInput) {
  const data = getAllCategoriesSchema.parse(input);
  const categories = await prisma.category.findMany({
    where: {
      AND: [
        data.name
          ? { name: { contains: data.name, mode: "insensitive" } }
          : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return categories;
}

export async function getCategoryById(input: getCategoryByIdInput) {
  const data = getCategoryByIdSchema.parse(input);
  const category = await prisma.category.findUnique({
    where: { id: data.id },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

export async function createCategory(
  input: createCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = createCategorySchema.parse(input);
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
  input: updateCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = updateCategorySchema.parse(input);

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
  input: deleteCategoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = deleteCategorySchema.parse(input);
  const category = await prisma.category.findUnique({
    where: { id: data.id },
  });
  if (!category) throw new NotFoundError("Category not found");
  await prisma.category.delete({
    where: { id: data.id },
  });
}
