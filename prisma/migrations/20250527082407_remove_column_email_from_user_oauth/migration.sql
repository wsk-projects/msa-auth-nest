/*
  Warnings:

  - You are about to drop the column `provider_email` on the `user_oauth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_oauth" DROP COLUMN "provider_email";
