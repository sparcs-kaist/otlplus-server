/*
  Warnings:

  - You are about to drop the column `is_agreed` on the `session_userprofile_notification` table. All the data in the column will be lost.
  - You are about to drop the `session_userprofile_fcm_token` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `agreementType` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `session_userprofile_fcm_token` DROP FOREIGN KEY `session_userprofile_fcm_token_userprofile_id_fkey`;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `agreementType` ENUM('INFO', 'MARKETING', 'NIGHT_MARKETING') NOT NULL;

-- AlterTable
ALTER TABLE `session_userprofile_notification` DROP COLUMN `is_agreed`,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `session_userprofile_fcm_token`;

-- CreateTable
CREATE TABLE `session_userprofile_device` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `deviceType` ENUM('ANDROID', 'IOS', 'WEB') NULL,
    `deviceOsVersion` VARCHAR(255) NULL,
    `appVersion` VARCHAR(255) NULL,

    INDEX `session_fcm_token_token_index`(`token`),
    UNIQUE INDEX `session_fcm_token_userprofile_id_token_uniq`(`userprofile_id`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_notification_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `notification_id` INTEGER NOT NULL,
    `notification_req_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `read_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session_userprofile_device` ADD CONSTRAINT `session_userprofile_device_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_notification_history` ADD CONSTRAINT `session_userprofile_notification_history_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_notification_history` ADD CONSTRAINT `session_userprofile_notification_history_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notification`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
