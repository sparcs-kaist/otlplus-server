/*
  Warnings:

  - You are about to drop the column `subject_professorId` on the `paper_prof` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `paper_prof` DROP FOREIGN KEY `paper_prof_subject_professorId_fkey`;

-- DropIndex
DROP INDEX `paper_prof_subject_professorId_fkey` ON `paper_prof`;

-- AlterTable
ALTER TABLE `paper_prof` DROP COLUMN `subject_professorId`;
