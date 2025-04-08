/*
  Warnings:

  - You are about to drop the column `aiChat` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userChat` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `message` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('user', 'ai');

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "aiChat",
DROP COLUMN "userChat",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "role" "role" NOT NULL;
