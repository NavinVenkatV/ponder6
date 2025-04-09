/*
  Warnings:

  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.
  - Added the required column `totalWeeks` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description",
ADD COLUMN     "totalWeeks" TEXT NOT NULL,
ADD COLUMN     "weeks" TEXT[];
