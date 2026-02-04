import { z } from "zod";
import {
  createMenuItemSchema,
  deleteMenuItemSchema,
  getAllMenuItemsSchema,
  getMenuItemByIdSchema,
  updateMenuItemSchema,
} from "./schemas";

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
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

export type MenuItemsList = {
  items: MenuItemInfo[];
  total: number;
  page: number;
  totalPages: number;
};
