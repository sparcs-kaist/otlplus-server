-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
