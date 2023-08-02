-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
