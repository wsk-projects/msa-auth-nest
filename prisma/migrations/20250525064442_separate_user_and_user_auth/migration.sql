/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_email_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "email",
DROP COLUMN "password";

-- CreateTable
CREATE TABLE "user_auth" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_user_id_key" ON "user_auth"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_email_key" ON "user_auth"("email");

-- AddForeignKey
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
