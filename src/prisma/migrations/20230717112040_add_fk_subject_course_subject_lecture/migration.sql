-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
