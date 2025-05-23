-- CreateEnum
CREATE TYPE "enum_login_status" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "login_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "status" "enum_login_status" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);
