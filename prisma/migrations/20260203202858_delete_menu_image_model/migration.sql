/*
  Warnings:

  - You are about to drop the `menu_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "menu_images" DROP CONSTRAINT "menu_images_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "image_url" TEXT;

-- DropTable
DROP TABLE "menu_images";
