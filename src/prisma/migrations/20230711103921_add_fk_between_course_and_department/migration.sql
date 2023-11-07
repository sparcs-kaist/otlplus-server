-- CreateIndex
CREATE INDEX `subject_course_department_id_fkey` ON `subject_course`(`department_id`);

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `subject_course_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
