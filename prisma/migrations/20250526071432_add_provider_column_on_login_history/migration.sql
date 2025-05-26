/*
  Warnings:

  - Added the required column `provider` to the `login_history` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "enum_login_provider" AS ENUM ('LOCAL', 'GOOGLE', 'KAKAO');

-- AlterTable
ALTER TABLE "login_history" ADD COLUMN     "provider" "enum_login_provider" NOT NULL;
