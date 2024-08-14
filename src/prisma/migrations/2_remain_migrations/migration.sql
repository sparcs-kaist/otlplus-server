-- AlterTable
ALTER TABLE `session_userprofile` 
    ADD COLUMN `date_joined` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN `first_name` VARCHAR(30) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(150) NOT NULL;

UPDATE session_userprofile su
INNER JOIN auth_user au on su.user_id = au.id
SET
    su.first_name = au.first_name,
    su.last_name = au.last_name,
    su.email = au.email,
    su.date_joined = au.date_joined;

-- AddColumn
ALTER TABLE `session_userprofile` ADD COLUMN `refresh_token` VARCHAR(255) NULL, ALTER COLUMN `date_joined` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `session_userprofile` ADD CONSTRAINT `session_userprofile_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- CreateIndex
CREATE INDEX `subject_course_department_id_fkey` ON `subject_course`(`department_id`);

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `subject_course_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

DELETE rv
FROM
    review_reviewvote rv
    LEFT JOIN review_review r ON r.id = rv.review_id
WHERE
    r.id IS NULL;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `review_review` DROP FOREIGN KEY `review_review_writer_id_fkey`;

-- AlterTable
ALTER TABLE `review_review` MODIFY `grade` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `load` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `speech` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `like` INTEGER NOT NULL DEFAULT 0,
    MODIFY `is_deleted` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `support_rate`
MODIFY `created_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);