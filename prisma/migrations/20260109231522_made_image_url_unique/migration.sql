/*
  Warnings:

  - A unique constraint covering the columns `[image_url]` on the table `menu_images` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "menu_images_image_url_key" ON "menu_images"("image_url");
