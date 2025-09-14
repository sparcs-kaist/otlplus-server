/*
  Warnings:

  - Added the required column `description` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `description` LONGTEXT NOT NULL;
