/*
  Warnings:

  - The primary key for the `sid_uid_map` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `sid_uid_map` DROP PRIMARY KEY,
    MODIFY `uid` VARCHAR(191) NOT NULL,
    MODIFY `sid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`uid`, `sid`);

-- AlterTable
ALTER TABLE `subject_course` MODIFY `level` VARCHAR(20) NULL DEFAULT SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);

-- AlterTable
ALTER TABLE `subject_lecture` MODIFY `level` VARCHAR(20) NULL DEFAULT SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);
