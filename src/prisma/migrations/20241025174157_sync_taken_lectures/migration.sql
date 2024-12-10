-- CreateTable
CREATE TABLE `sync_taken_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    UNIQUE INDEX `sync_taken_lectures_student_id_lecture_id_key`(`student_id`, `lecture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sync_taken_lectures` ADD CONSTRAINT `sync_taken_lectures_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
