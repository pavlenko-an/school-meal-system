/*
  Warnings:

  - The values [new] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `payment_status_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "order_status_new" AS ENUM ('draft', 'published', 'accepted', 'in_progress', 'completed', 'cancelled');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "order_status_new" USING ("status"::text::"order_status_new");
ALTER TABLE "order_status_history" ALTER COLUMN "previous_status" TYPE "order_status_new" USING ("previous_status"::text::"order_status_new");
ALTER TABLE "order_status_history" ALTER COLUMN "new_status" TYPE "order_status_new" USING ("new_status"::text::"order_status_new");
ALTER TYPE "order_status" RENAME TO "order_status_old";
ALTER TYPE "order_status_new" RENAME TO "order_status";
DROP TYPE "public"."order_status_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- DropForeignKey
ALTER TABLE "payment_status_history" DROP CONSTRAINT "payment_status_history_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_status_history" DROP CONSTRAINT "payment_status_history_order_id_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'draft';

-- DropTable
DROP TABLE "payment_status_history";

-- CreateTable
CREATE TABLE "order_payment_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "previous_status" "payment_status" NOT NULL,
    "new_status" "payment_status" NOT NULL,
    "actor_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_payment_history_order_id_idx" ON "order_payment_history"("order_id");

-- CreateIndex
CREATE INDEX "order_payment_history_actor_id_idx" ON "order_payment_history"("actor_id");

-- AddForeignKey
ALTER TABLE "order_payment_history" ADD CONSTRAINT "order_payment_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment_history" ADD CONSTRAINT "order_payment_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
