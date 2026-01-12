-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_menu_item_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_school_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_supplier_id_fkey";

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "menu_item_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "school_id" DROP NOT NULL,
ALTER COLUMN "supplier_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
