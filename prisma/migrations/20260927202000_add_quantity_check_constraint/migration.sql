-- AlterTable
ALTER TABLE "ProductVariant" ADD CONSTRAINT "product_variant_quantity_check" CHECK (quantity >= 0);
