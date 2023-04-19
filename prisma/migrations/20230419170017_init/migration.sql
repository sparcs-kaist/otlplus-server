-- CreateTable
CREATE TABLE `session_userprofile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `sid` VARCHAR(30) NOT NULL,
    `language` VARCHAR(5) NOT NULL,
    `portal_check` INTEGER NOT NULL DEFAULT 0,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `session_userprofile_student_id_key`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `num_id` VARCHAR(4) NOT NULL,
    `code` VARCHAR(5) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `name_en` VARCHAR(60) NULL,
    `visible` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `old_code` VARCHAR(10) NOT NULL,
    `department_id` INTEGER NOT NULL,
    `type` VARCHAR(12) NOT NULL,
    `type_en` VARCHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `title_en` VARCHAR(200) NOT NULL,
    `summary` VARCHAR(400) NOT NULL,
    `grade_sum` DOUBLE NOT NULL,
    `load_sum` DOUBLE NOT NULL,
    `speech_sum` DOUBLE NOT NULL,
    `review_total_weight` DOUBLE NOT NULL,
    `grade` DOUBLE NOT NULL,
    `load` DOUBLE NOT NULL,
    `speech` DOUBLE NOT NULL,
    `latest_written_datetime` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_lecture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `old_code` VARCHAR(10) NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` SMALLINT NOT NULL,
    `department_id` INTEGER NOT NULL,
    `class_no` VARCHAR(4) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `title_en` VARCHAR(200) NOT NULL,
    `type` VARCHAR(12) NOT NULL,
    `type_en` VARCHAR(36) NOT NULL,
    `audience` INTEGER NOT NULL,
    `credit` INTEGER NOT NULL,
    `num_classes` INTEGER NOT NULL,
    `num_labs` INTEGER NOT NULL,
    `credit_au` INTEGER NOT NULL,
    `limit` INTEGER NOT NULL,
    `num_people` INTEGER NOT NULL,
    `is_english` TINYINT NOT NULL,
    `deleted` TINYINT NOT NULL,
    `course_id` INTEGER NOT NULL,
    `grade_sum` DOUBLE NOT NULL,
    `load_sum` DOUBLE NOT NULL,
    `speech_sum` DOUBLE NOT NULL,
    `grade` DOUBLE NOT NULL,
    `load` DOUBLE NOT NULL,
    `speech` DOUBLE NOT NULL,
    `review_total_weight` DOUBLE NOT NULL,
    `class_title` VARCHAR(100) NULL,
    `class_title_en` VARCHAR(100) NULL,
    `common_title` VARCHAR(100) NULL,
    `common_title_en` VARCHAR(100) NULL,

    INDEX `subject_lecture_deleted_idx`(`deleted`),
    INDEX `subject_lecture_type_en_idx`(`type_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
