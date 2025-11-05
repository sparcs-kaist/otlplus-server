/*
  Warnings:

  - You are about to drop the `block_custom_blocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timetable_timetable_customblocks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `timetable_timetable_customblocks` DROP FOREIGN KEY `fk_timetable_timetable_custom__block_custom_blocks`;

-- DropForeignKey
ALTER TABLE `timetable_timetable_customblocks` DROP FOREIGN KEY `fk_timetable_timetable_custom__timetable_timetable`;

-- AlterTable
ALTER TABLE `session_userprofile` ADD COLUMN `degree` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `subject_course` MODIFY `level` VARCHAR(20) NULL DEFAULT (substr(regexp_replace(`new_code`,'[^0-9]',''),1,1));

-- AlterTable
ALTER TABLE `subject_lecture` MODIFY `level` VARCHAR(20) NULL DEFAULT (substr(regexp_replace(`new_code`,'[^0-9]',''),1,1));

-- DropTable
DROP TABLE `block_custom_blocks`;

-- DropTable
DROP TABLE `timetable_timetable_customblocks`;

-- CreateTable
CREATE TABLE `sid_uid_map` (
    `uid` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uid`, `sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
