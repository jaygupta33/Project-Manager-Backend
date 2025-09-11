-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD');

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "projectStatus" "public"."ProjectStatus" NOT NULL DEFAULT 'ACTIVE';
