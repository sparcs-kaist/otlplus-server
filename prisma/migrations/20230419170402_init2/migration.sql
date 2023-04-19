/*
  Warnings:

  - Added the required column `department_id` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session_userprofile` ADD COLUMN `department_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `student_id` VARCHAR(10) NOT NULL;
