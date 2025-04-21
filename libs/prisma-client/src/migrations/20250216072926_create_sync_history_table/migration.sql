-- CreateTable
CREATE TABLE `sync_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('DEPARTMENT', 'COURSE', 'LECTURE', 'PROFESSOR', 'MAJORS', 'DEGREE','EXAMTIME','CLASSTIME','TAKEN_LECTURES','CHARGE') NOT NULL,
    `startTime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `endTime` DATETIME(0),
    `data` VARCHAR(191),
    `year` INTEGER,
    `semester` INTEGER,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `session_userprofile_student_id_index` ON `session_userprofile`(`student_id`);
