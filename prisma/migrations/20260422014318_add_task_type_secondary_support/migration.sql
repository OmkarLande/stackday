/*
  Warnings:

  - The `status` column on the `DailyTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('primary', 'secondary');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'completed', 'skipped');

-- DropIndex
DROP INDEX "DailyTask_user_id_task_date_key";

-- AlterTable
ALTER TABLE "DailyTask" ADD COLUMN     "is_optional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "task_type" "TaskType" NOT NULL DEFAULT 'secondary',
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3;

-- CreateIndex
CREATE INDEX "DailyTask_user_id_task_date_task_type_idx" ON "DailyTask"("user_id", "task_date", "task_type");
