/*
  Warnings:

  - Added the required column `professor_name` to the `paper` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paper` ADD COLUMN `professor_name` VARCHAR(255) NOT NULL;
