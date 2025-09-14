/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `session_userprofile_notification_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session_userprofile_notification_history` ADD COLUMN `content` LONGTEXT NOT NULL,
    ADD COLUMN `fcm_id` LONGTEXT NULL,
    ADD COLUMN `to` LONGTEXT NULL,
    MODIFY `notification_req_id` LONGTEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `notification_name_uniq` ON `notification`(`name`);
