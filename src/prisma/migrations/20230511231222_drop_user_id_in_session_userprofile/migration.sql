/*
  Warnings:

  - You are about to drop the column `user_id` on the `session_userprofile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `session_userprofile_user_id_09dd6af1_uniq` ON `session_userprofile`;

-- AlterTable
ALTER TABLE `session_userprofile` DROP COLUMN `user_id`,
    ALTER COLUMN `date_joined` DROP DEFAULT;
