-- CreateTable
CREATE TABLE "binanceUsers" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "depositAddress" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "binanceUsers_pkey" PRIMARY KEY ("id")
);
