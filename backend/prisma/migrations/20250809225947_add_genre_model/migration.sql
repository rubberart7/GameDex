/*
  Warnings:

  - You are about to drop the column `genres` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "genres";

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "rawgGenreId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_gameId_rawgGenreId_key" ON "Genre"("gameId", "rawgGenreId");

-- AddForeignKey
ALTER TABLE "Genre" ADD CONSTRAINT "Genre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
