-- AddForeignKey
ALTER TABLE `session_userprofile` ADD CONSTRAINT `session_userprofile_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
