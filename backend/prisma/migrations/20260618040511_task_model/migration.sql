-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TIMED', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskSource" AS ENUM ('MANUAL', 'JSON', 'AI');

-- CreateEnum
CREATE TYPE "CreatedBy" AS ENUM ('USER', 'AI_AGENT');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "type" "TaskType" NOT NULL,
    "taskStatus" "TaskStatus" NOT NULL,
    "priority" "Priority" NOT NULL,
    "taskSource" "TaskSource" NOT NULL,
    "createdBy" "CreatedBy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
