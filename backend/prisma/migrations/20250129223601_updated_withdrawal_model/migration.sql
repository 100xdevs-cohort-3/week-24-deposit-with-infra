/*
  Warnings:

  - Added the required column `withdrawalFromAddres` to the `withdrawalHotWallet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "withdrawalHotWallet_userToAddress_key";

-- AlterTable
ALTER TABLE "withdrawalHotWallet" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "withdrawalFromAddres" TEXT NOT NULL;
