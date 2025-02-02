-- CreateTable
CREATE TABLE "withdrawalHotWallet" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "userToAddress" TEXT NOT NULL,
    "TransactionHash" TEXT NOT NULL,

    CONSTRAINT "withdrawalHotWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "withdrawalHotWallet_userToAddress_key" ON "withdrawalHotWallet"("userToAddress");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawalHotWallet_TransactionHash_key" ON "withdrawalHotWallet"("TransactionHash");
