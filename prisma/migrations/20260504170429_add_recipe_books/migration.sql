-- CreateTable
CREATE TABLE "RecipeBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecipeBookMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeBookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "acceptedAt" DATETIME,
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeBookMember_recipeBookId_fkey" FOREIGN KEY ("recipeBookId") REFERENCES "RecipeBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeBookMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeBookMember_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeBookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeBookId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "addedByUserId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeBookEntry_recipeBookId_fkey" FOREIGN KEY ("recipeBookId") REFERENCES "RecipeBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeBookEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeBookEntry_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_User" ("avatarUrl", "bio", "coverImageUrl", "createdAt", "email", "emailVerified", "id", "image", "instagramHandle", "isPublic", "name", "showName", "twitterHandle", "username", "websiteUrl", "youtubeUrl") SELECT "avatarUrl", "bio", "coverImageUrl", "createdAt", "email", "emailVerified", "id", "image", "instagramHandle", "isPublic", "name", "showName", "twitterHandle", "username", "websiteUrl", "youtubeUrl" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecipeBookMember_recipeBookId_userId_key" ON "RecipeBookMember"("recipeBookId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeBookEntry_recipeBookId_recipeId_key" ON "RecipeBookEntry"("recipeBookId", "recipeId");
