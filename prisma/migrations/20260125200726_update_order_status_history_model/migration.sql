/*
  Warnings:

  - You are about to drop the column `created_at` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `from_status` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `to_status` on the `order_status_history` table. All the data in the column will be lost.
  - Added the required column `new_status` to the `order_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previous_status` to the `order_status_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_status_history" DROP COLUMN "created_at",
DROP COLUMN "from_status",
DROP COLUMN "to_status",
ADD COLUMN     "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "new_status" "order_status" NOT NULL,
ADD COLUMN     "previous_status" "order_status" NOT NULL;
