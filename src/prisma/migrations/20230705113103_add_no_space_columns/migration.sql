/*
  Warnings:

  - Added the required column `title_en_no_space` to the `subject_course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_no_space` to the `subject_course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `subject_course` ADD COLUMN `title_en_no_space` VARCHAR(200) NOT NULL,
    ADD COLUMN `title_no_space` VARCHAR(100) NOT NULL;
