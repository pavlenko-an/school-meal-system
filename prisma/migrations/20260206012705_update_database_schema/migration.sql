/*
  Warnings:

  - You are about to drop the column `userId` on the `payment_status_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_status_history" DROP COLUMN "userId";
