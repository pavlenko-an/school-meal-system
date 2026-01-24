import { z } from "zod";
import { getAllMenuItemsSchema } from "./get-all-menu-items.schema";
import { getMenuItemByIdSchema } from "./get-menu-item-by-id.schema";
import { createMenuItemSchema } from "./create-menu-item.schema";
import { updateMenuItemSchema } from "./update-menu-item.schema";
import { deleteMenuItemSchema } from "./delete-menu-item.schema";

export type getAllMenuItemsInput = z.infer<typeof getAllMenuItemsSchema>;
export type getMenuItemByIdInput = z.infer<typeof getMenuItemByIdSchema>;
export type createMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type updateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type deleteMenuItemInput = z.infer<typeof deleteMenuItemSchema>;

export type MenuItemInfo = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  images:
    | {
        id: string;
        imageUrl: string;
        isPrimary: boolean;
      }[]
    | null;
};
