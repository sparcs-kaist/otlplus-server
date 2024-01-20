/*
  Warnings:

  - You are about to drop the column `language` on the `session_userprofile` table. All the data in the column will be lost.
  - You are about to drop the column `portal_check` on the `session_userprofile` table. All the data in the column will be lost.
  - Added the required column `date_joined` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session_userprofile` DROP COLUMN `language`,
    DROP COLUMN `portal_check`,
    ADD COLUMN `date_joined` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN `first_name` VARCHAR(30) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(150) NOT NULL;

UPDATE session_userprofile su
INNER JOIN auth_user au on su.user_id = au.id
SET
    su.first_name = au.first_name,
    su.last_name = au.last_name,
    su.email = au.email,
    su.date_joined = au.date_joined