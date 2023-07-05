-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
