import { z } from "zod";
import { getAllCategoriesSchema } from "./get-all-categories.schema";
import { getCategoryByIdSchema } from "./get-category-by-id.schema";
import { createCategorySchema } from "./create-category.schema";
import { updateCategorySchema } from "./update-category.schema";
import { deleteCategorySchema } from "./delete-category.schema";

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
