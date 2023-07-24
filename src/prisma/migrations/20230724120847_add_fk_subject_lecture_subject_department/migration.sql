-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
