-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
