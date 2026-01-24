import { prisma } from "@/shared/db/prisma";
import { getMenuItemByIdInput } from "../model/menu-item.types";
import { getMenuItemByIdSchema } from "../model/get-menu-item-by-id.schema";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function getMenuItemById(data: getMenuItemByIdInput) {
  const validated = getMenuItemByIdSchema.parse(data);
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: validated.id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      isAvailable: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          isPrimary: true,
        },
      },
    },
  });
  if (!menuItem) {
    throw new NotFoundError("Menu item not found");
  }
  return menuItem;
}
