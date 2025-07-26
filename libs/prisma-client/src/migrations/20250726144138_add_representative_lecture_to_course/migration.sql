/*
  Warnings:

  - You are about to drop the column `prof_name` on the `paper` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paper` DROP COLUMN `prof_name`;

-- AlterTable
ALTER TABLE `subject_course` ADD COLUMN `representative_lecture_id` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `subject_lecture_year_semester_deleted_type_en` ON `subject_lecture`(`semester`, `year`, `deleted`, `type_en`, `id`);

-- CreateIndex
CREATE INDEX `subject_lecture_year_semester_deleted_type_en_department` ON `subject_lecture`(`year`, `semester`, `type_en`, `department_id`, `deleted`);
