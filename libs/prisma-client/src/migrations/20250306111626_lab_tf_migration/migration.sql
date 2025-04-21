-- AlterTable
ALTER TABLE `sync_history` MODIFY `endTime` DATETIME(3) NULL,
    MODIFY `data` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `paper_prof_to_subject_prof` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_professor_id` INTEGER NOT NULL,
    `paper_professor_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_professor_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paper_professor_id` INTEGER NOT NULL,
    `subject_department_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_professor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_name` VARCHAR(255) NULL,
    `professor_name_en` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_id` INTEGER NULL,
    `professor_name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(300) NULL,
    `abstract` TEXT NULL,
    `keywords` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `doi` VARCHAR(100) NULL,
    `pdf_link` VARCHAR(255) NULL,
    `xml_link` VARCHAR(255) NULL,
    `url` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `paper_prof_to_subject_prof` ADD CONSTRAINT `paper_prof_to_subject_prof_subject_professor_id_fkey` FOREIGN KEY (`subject_professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper_prof_to_subject_prof` ADD CONSTRAINT `paper_prof_to_subject_prof_paper_professor_id_fkey` FOREIGN KEY (`paper_professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper_professor_department` ADD CONSTRAINT `paper_professor_department_paper_professor_id_fkey` FOREIGN KEY (`paper_professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper_professor_department` ADD CONSTRAINT `paper_professor_department_subject_department_id_fkey` FOREIGN KEY (`subject_department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
