-- AlterTable
ALTER TABLE `sync_history` MODIFY `endTime` DATETIME(3) NULL,
    MODIFY `data` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `papers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_id` INTEGER NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `abstract` TEXT NOT NULL,
    `keywords` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `doi` VARCHAR(100) NOT NULL,
    `pdf_link` VARCHAR(255) NOT NULL,
    `xml_link` VARCHAR(255) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_prof` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_name` VARCHAR(255) NOT NULL,
    `subject_professorId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prof_names_to_prof_link` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prof_names_to_prof_id` INTEGER NOT NULL,
    `subject_professor_id` INTEGER NOT NULL,

    UNIQUE INDEX `prof_names_to_prof_link_prof_names_to_prof_id_subject_profes_key`(`prof_names_to_prof_id`, `subject_professor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `papers` ADD CONSTRAINT `papers_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `paper_prof`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper_prof` ADD CONSTRAINT `paper_prof_subject_professorId_fkey` FOREIGN KEY (`subject_professorId`) REFERENCES `subject_professor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prof_names_to_prof_link` ADD CONSTRAINT `prof_names_to_prof_link_prof_names_to_prof_id_fkey` FOREIGN KEY (`prof_names_to_prof_id`) REFERENCES `paper_prof`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `prof_names_to_prof_link` ADD CONSTRAINT `prof_names_to_prof_link_subject_professor_id_fkey` FOREIGN KEY (`subject_professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
