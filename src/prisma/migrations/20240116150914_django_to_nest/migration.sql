/*
  Warnings:

  - You are about to drop the column `language` on the `session_userprofile` table. All the data in the column will be lost.
  - You are about to drop the column `portal_check` on the `session_userprofile` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `session_userprofile` table. All the data in the column will be lost.
  - You are about to drop the `subject_professor_course_list` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date_joined` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `session_userprofile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en_no_space` to the `subject_course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_no_space` to the `subject_course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en_no_space` to the `subject_lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_no_space` to the `subject_lecture` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `session_userprofile_user_id_09dd6af1_uniq` ON `session_userprofile`;

-- AlterTable
ALTER TABLE `review_review` MODIFY `grade` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `load` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `speech` SMALLINT NOT NULL DEFAULT 0,
    MODIFY `like` INTEGER NOT NULL DEFAULT 0,
    MODIFY `is_deleted` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `session_userprofile` DROP COLUMN `language`,
    DROP COLUMN `portal_check`,
    DROP COLUMN `user_id`,
    ADD COLUMN `date_joined` DATETIME(0) NOT NULL,
    ADD COLUMN `first_name` VARCHAR(30) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(150) NOT NULL,
    ADD COLUMN `refresh_token` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `subject_course` ADD COLUMN `title_en_no_space` VARCHAR(200) NOT NULL,
    ADD COLUMN `title_no_space` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `subject_lecture` ADD COLUMN `title_en_no_space` VARCHAR(200) NOT NULL,
    ADD COLUMN `title_no_space` VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE `subject_professor_course_list`;

-- CreateIndex
CREATE INDEX `session_userprofile_department_id_fkey` ON `session_userprofile`(`department_id`);

-- CreateIndex
CREATE INDEX `session_userprofile_favorite_departments_department_id_fkey` ON `session_userprofile_favorite_departments`(`department_id`);

-- CreateIndex
CREATE INDEX `session_userprofile_taken_lectures_lecture_id_fkey` ON `session_userprofile_taken_lectures`(`lecture_id`);

-- CreateIndex
CREATE INDEX `subject_course_department_id_fkey` ON `subject_course`(`department_id`);

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_review` ADD CONSTRAINT `review_review_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session_userprofile` ADD CONSTRAINT `session_userprofile_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_favorite_departments` ADD CONSTRAINT `session_userprofile_favorite_departments_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_taken_lectures` ADD CONSTRAINT `session_userprofile_taken_lectures_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `subject_course_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_professors` ADD CONSTRAINT `subject_course_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture` ADD CONSTRAINT `subject_lecture_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_lecture_professors` ADD CONSTRAINT `subject_lecture_professors_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
