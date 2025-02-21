/*
  Warnings:

  - You are about to alter the column `total` on the `AssetDetails` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetDetails" (
    "assetId" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,
    "assetName" TEXT,
    "unitName" TEXT,
    "total" BIGINT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "defaultFrozen" BOOLEAN NOT NULL,
    "url" TEXT
);
INSERT INTO "new_AssetDetails" ("assetId", "assetName", "creator", "decimals", "defaultFrozen", "total", "unitName", "url") SELECT "assetId", "assetName", "creator", "decimals", "defaultFrozen", "total", "unitName", "url" FROM "AssetDetails";
DROP TABLE "AssetDetails";
ALTER TABLE "new_AssetDetails" RENAME TO "AssetDetails";
CREATE UNIQUE INDEX "AssetDetails_assetId_key" ON "AssetDetails"("assetId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
