-- AlterTable
ALTER TABLE `session_userprofile` MODIFY `portal_check` INTEGER NULL DEFAULT 0,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `department_id` INTEGER NULL;
