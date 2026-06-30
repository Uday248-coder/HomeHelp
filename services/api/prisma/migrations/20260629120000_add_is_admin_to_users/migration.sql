-- Add missing is_admin column (schema has it but initial migration was incomplete)
ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- Add missing razorpay_order_id column (schema has it but initial migration was incomplete)
ALTER TABLE "payments" ADD COLUMN "razorpay_order_id" TEXT;
