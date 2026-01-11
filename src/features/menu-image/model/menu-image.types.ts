import { z } from "zod";
import { getAllMenuImagesSchema } from "./get-all-menu-images.schema";
import { getMenuImageByIdSchema } from "./get-menu-image-by-id.schema";
import { createMenuImageSchema } from "./create-menu-image.schema";
import { updateMenuImageSchema } from "./update-menu-image.schema";
import { deleteMenuImageSchema } from "./delete-menu-image.schema";

export type getAllMenuImagesInput = z.infer<typeof getAllMenuImagesSchema>;
export type getMenuImageByIdInput = z.infer<typeof getMenuImageByIdSchema>;
export type createMenuImageInput = z.infer<typeof createMenuImageSchema>;
export type updateMenuImageInput = z.infer<typeof updateMenuImageSchema>;
export type deleteMenuImageInput = z.infer<typeof deleteMenuImageSchema>;
