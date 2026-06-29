-- Add missing razorpay_order_id column (schema has it but initial migration was incomplete)
ALTER TABLE "payments" ADD COLUMN "razorpay_order_id" TEXT;
