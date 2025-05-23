/*
  Warnings:

  - You are about to drop the column `createdAt` on the `rt_blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `rt_blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `rt_blacklist` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expires_at` to the `rt_blacklist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `rt_blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rt_blacklist" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
