import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CategoriesList,
  CategoryInfo,
  getAllCategoriesInput,
  getCategoryByIdInput,
} from "./types";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getAllCategoriesSchema, getCategoryByIdSchema } from "./schemas";

export async function getAllCategories(
  data: getAllCategoriesInput,
): Promise<CategoriesList> {
  const validated = getAllCategoriesSchema.parse(data);
  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;

  const filters: Prisma.CategoryWhereInput[] = [];
  if (validated.name) {
    filters.push({ name: { contains: validated.name, mode: "insensitive" } });
  }
  const categories = await prisma.category.findMany({
    where: {
      AND: filters.length > 0 ? filters : undefined,
    },
    take: limit,
    skip: skip,
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  const total = await prisma.category.count({
    where: {
      AND: filters.length > 0 ? filters : undefined,
    },
  });
  const totalPages = Math.ceil(total / limit);
  return {
    categories,
    total,
    page: page,
    totalPages,
  };
}

export async function getCategoryById(
  data: getCategoryByIdInput,
): Promise<CategoryInfo> {
  const validated = getCategoryByIdSchema.parse(data);
  const category = await prisma.category.findUnique({
    where: { id: validated.id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  if (!category) {
    throw new NotFoundError("Категорія не знайдена");
  }
  return category;
}
