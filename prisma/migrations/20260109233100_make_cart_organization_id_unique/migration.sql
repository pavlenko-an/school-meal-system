/*
  Warnings:

  - A unique constraint covering the columns `[organization_id]` on the table `carts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "carts_organization_id_key" ON "carts"("organization_id");
