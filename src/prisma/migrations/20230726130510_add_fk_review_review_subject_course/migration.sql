-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
