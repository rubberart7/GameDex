-- CreateTable
CREATE TABLE "UserRecommendationCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendations" JSONB NOT NULL,
    "collectionHash" TEXT NOT NULL,

    CONSTRAINT "UserRecommendationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRecommendationCache_userId_key" ON "UserRecommendationCache"("userId");

-- AddForeignKey
ALTER TABLE "UserRecommendationCache" ADD CONSTRAINT "UserRecommendationCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
