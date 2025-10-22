-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "reference" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Withdraw" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdraw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Withdraw_reference_key" ON "public"."Withdraw"("reference");

-- AddForeignKey
ALTER TABLE "public"."Withdraw" ADD CONSTRAINT "Withdraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
