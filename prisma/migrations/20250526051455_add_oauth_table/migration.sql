-- CreateEnum
CREATE TYPE "enum_oauth_provider" AS ENUM ('GOOGLE', 'KAKAO');

-- CreateTable
CREATE TABLE "user_oauth" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "enum_oauth_provider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_provider_id_key" ON "user_oauth"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_provider_provider_id_key" ON "user_oauth"("provider", "provider_id");

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
