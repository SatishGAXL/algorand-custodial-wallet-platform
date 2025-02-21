/*
  Warnings:

  - Added the required column `creator` to the `AssetDetails` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetDetails" (
    "assetId" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,
    "assetName" TEXT,
    "unitName" TEXT,
    "total" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL,
    "defaultFrozen" BOOLEAN NOT NULL,
    "url" TEXT
);
INSERT INTO "new_AssetDetails" ("assetId", "assetName", "decimals", "defaultFrozen", "total", "unitName", "url") SELECT "assetId", "assetName", "decimals", "defaultFrozen", "total", "unitName", "url" FROM "AssetDetails";
DROP TABLE "AssetDetails";
ALTER TABLE "new_AssetDetails" RENAME TO "AssetDetails";
CREATE UNIQUE INDEX "AssetDetails_assetId_key" ON "AssetDetails"("assetId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
