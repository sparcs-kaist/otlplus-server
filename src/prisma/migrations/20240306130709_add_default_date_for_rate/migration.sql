/*
Warnings:
- Made the column `created_datetime` on table `support_rate` required. This step will fail if there are existing NULL values in that column.
*/
-- AlterTable
ALTER TABLE `support_rate`
MODIFY `created_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);