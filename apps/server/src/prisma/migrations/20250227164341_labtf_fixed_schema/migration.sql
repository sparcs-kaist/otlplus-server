/*
  Warnings:

  - You are about to drop the `paper_prof` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `papers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prof_names_to_prof_link` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `papers` DROP FOREIGN KEY `papers_professor_id_fkey`;

-- DropForeignKey
ALTER TABLE `prof_names_to_prof_link` DROP FOREIGN KEY `prof_names_to_prof_link_prof_names_to_prof_id_fkey`;

-- DropForeignKey
ALTER TABLE `prof_names_to_prof_link` DROP FOREIGN KEY `prof_names_to_prof_link_subject_professor_id_fkey`;

-- DropTable
DROP TABLE `paper_prof`;

-- DropTable
DROP TABLE `papers`;

-- DropTable
DROP TABLE `prof_names_to_prof_link`;

-- CreateTable
CREATE TABLE `paper_prof_to_subject_prof` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_professor_id` INTEGER NOT NULL,
    `paper_professor_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_professor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper` (
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

-- AddForeignKey
ALTER TABLE `paper_prof_to_subject_prof` ADD CONSTRAINT `paper_prof_to_subject_prof_subject_professor_id_fkey` FOREIGN KEY (`subject_professor_id`) REFERENCES `subject_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper_prof_to_subject_prof` ADD CONSTRAINT `paper_prof_to_subject_prof_paper_professor_id_fkey` FOREIGN KEY (`paper_professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
