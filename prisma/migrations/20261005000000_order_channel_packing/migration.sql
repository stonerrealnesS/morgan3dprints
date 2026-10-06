-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'website',
ADD COLUMN     "channelOrderId" TEXT,
ADD COLUMN     "packedAt" TIMESTAMP(3),
ALTER COLUMN "stripeSessionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_channel_channelOrderId_key" ON "Order"("channel", "channelOrderId");
