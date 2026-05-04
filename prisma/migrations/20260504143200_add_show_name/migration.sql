-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "showName" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "websiteUrl" TEXT,
    "twitterHandle" TEXT,
    "instagramHandle" TEXT,
    "youtubeUrl" TEXT
);
INSERT INTO "new_User" ("avatarUrl", "bio", "coverImageUrl", "createdAt", "email", "emailVerified", "id", "image", "instagramHandle", "isPublic", "name", "twitterHandle", "username", "websiteUrl", "youtubeUrl") SELECT "avatarUrl", "bio", "coverImageUrl", "createdAt", "email", "emailVerified", "id", "image", "instagramHandle", "isPublic", "name", "twitterHandle", "username", "websiteUrl", "youtubeUrl" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
