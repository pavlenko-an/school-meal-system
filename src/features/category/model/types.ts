import { z } from "zod";
import {
  createCategorySchema,
  deleteCategorySchema,
  getAllCategoriesSchema,
  getCategoryByIdSchema,
  updateCategorySchema,
} from "./schemas";

export type getAllCategoriesInput = z.infer<typeof getAllCategoriesSchema>;
export type getCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type createCategoryInput = z.infer<typeof createCategorySchema>;
export type updateCategoryInput = z.infer<typeof updateCategorySchema>;
export type deleteCategoryInput = z.infer<typeof deleteCategorySchema>;

export interface CategoryInfo {
  id: string;
  name: string;
  description: string | null;
}

export interface CategoriesList {
  categories: CategoryInfo[];
  total: number;
  page: number;
  totalPages: number;
}
