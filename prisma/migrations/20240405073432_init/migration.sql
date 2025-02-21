-- CreateTable
CREATE TABLE "AssetDetails" (
    "assetId" INTEGER NOT NULL,
    "assetName" TEXT,
    "unitName" TEXT,
    "total" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL,
    "defaultFrozen" BOOLEAN NOT NULL,
    "url" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetDetails_assetId_key" ON "AssetDetails"("assetId");
