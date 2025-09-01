-- AlterTable
ALTER TABLE `session_userprofile` ADD COLUMN `kaist_id` VARCHAR(30) NULL,
    ADD COLUMN `last_login` DATETIME(0) NULL,
    ADD COLUMN `status` VARCHAR(30) NULL,
    ADD COLUMN `uid` VARCHAR(30) NULL;
