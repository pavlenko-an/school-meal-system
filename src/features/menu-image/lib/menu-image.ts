import { prisma } from "@/shared/db/prisma";
import { createMenuImageSchema } from "../model/create-menu-image.schema";
import { deleteMenuImageSchema } from "../model/delete-menu-image.schema";
import { getAllMenuImagesSchema } from "../model/get-all-menu-images.schema";
import { getMenuImageByIdSchema } from "../model/get-menu-image-by-id.schema";
import {
  createMenuImageInput,
  deleteMenuImageInput,
  getAllMenuImagesInput,
  getMenuImageByIdInput,
  updateMenuImageInput,
} from "../model/menu-image.types";
import { updateMenuImageSchema } from "../model/update-menu-image.schema";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllMenuImages(input: getAllMenuImagesInput) {
  const data = getAllMenuImagesSchema.parse(input);
  const existingMenuItem = await prisma.menuItem.findUnique({
    where: { id: data.menuItemId },
  });
  if (!existingMenuItem) {
    throw new NotFoundError("Menu item not found");
  }
  const menuImages = await prisma.menuImage.findMany({
    where: {
      menuItemId: data.menuItemId,
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return menuImages;
}

export async function getMenuImageById(input: getMenuImageByIdInput) {
  const data = getMenuImageByIdSchema.parse(input);
  const menuImage = await prisma.menuImage.findUnique({
    where: { id: data.id },
  });
  if (!menuImage) {
    throw new NotFoundError("Menu image not found");
  }
  return menuImage;
}

export async function createMenuImage(
  input: createMenuImageInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = createMenuImageSchema.parse(input);

  const [existingImageUrl, existingPrimaryImage] = await Promise.all([
    prisma.menuImage.findUnique({
      where: { imageUrl: data.imageUrl },
    }),
    prisma.menuImage.findFirst({
      where: {
        menuItemId: data.menuItemId,
        isPrimary: true,
      },
    }),
  ]);

  if (existingImageUrl) {
    throw new ConflictError("Menu image with this URL already exists");
  }
  if (data.isPrimary && existingPrimaryImage) {
    throw new ConflictError("Primary image for this menu item already exists");
  }
  const menuImage = await prisma.menuImage.create({
    data: {
      menuItemId: data.menuItemId,
      imageUrl: data.imageUrl,
      isPrimary: data.isPrimary ?? false,
    },
  });
  return menuImage;
}

export async function updateMenuImage(
  input: updateMenuImageInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = updateMenuImageSchema.parse(input);
  const menuImage = await prisma.menuImage.findUnique({
    where: { id: data.id },
  });
  if (!menuImage) {
    throw new NotFoundError("Menu image not found");
  }

  const updateData: Record<string, unknown> = {};
  if (data.imageUrl !== undefined) {
    const existingImageUrl = await prisma.menuImage.findUnique({
      where: { imageUrl: data.imageUrl },
    });
    if (existingImageUrl && existingImageUrl.id !== data.id) {
      throw new ConflictError("Menu image with this URL already exists");
    }
    updateData.imageUrl = data.imageUrl;
  }
  if (data.isPrimary !== undefined) {
    if (data.isPrimary) {
      const existingPrimaryImage = await prisma.menuImage.findFirst({
        where: {
          menuItemId: menuImage.menuItemId,
          isPrimary: true,
          id: { not: data.id },
        },
      });
      if (existingPrimaryImage) {
        throw new ConflictError(
          "Primary image for this menu item already exists"
        );
      }
    }
    updateData.isPrimary = data.isPrimary;
  }
  const updatedMenuImage = await prisma.menuImage.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedMenuImage;
}

export async function deleteMenuImage(
  input: deleteMenuImageInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const data = deleteMenuImageSchema.parse(input);
  const menuImage = await prisma.menuImage.findUnique({
    where: { id: data.id },
  });
  if (!menuImage) {
    throw new NotFoundError("Menu image not found");
  }
  await prisma.menuImage.delete({
    where: { id: data.id },
  });
}
