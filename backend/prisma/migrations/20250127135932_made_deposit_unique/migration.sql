/*
  Warnings:

  - A unique constraint covering the columns `[depositAddress]` on the table `binanceUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "binanceUsers_depositAddress_key" ON "binanceUsers"("depositAddress");
