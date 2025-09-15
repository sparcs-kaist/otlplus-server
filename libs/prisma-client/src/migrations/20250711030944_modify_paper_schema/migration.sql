/*
  Warnings:

  - You are about to drop the column `category` on the `paper` table. All the data in the column will be lost.
  - You are about to drop the column `professor_name` on the `paper` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `paper` table. All the data in the column will be lost.
  - You are about to drop the column `professor_name` on the `paper_professor` table. All the data in the column will be lost.
  - You are about to drop the column `professor_name_en` on the `paper_professor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paper` DROP COLUMN `category`,
    DROP COLUMN `professor_name`,
    DROP COLUMN `url`,
    ADD COLUMN `aggregationType` VARCHAR(30) NULL,
    ADD COLUMN `article_number` VARCHAR(50) NULL,
    ADD COLUMN `cited_count` DOUBLE NULL,
    ADD COLUMN `citedby_count` DOUBLE NULL,
    ADD COLUMN `coverDate` DATE NULL,
    ADD COLUMN `coverDisplayDate` VARCHAR(100) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `eIssn` VARCHAR(10) NULL,
    ADD COLUMN `issn` VARCHAR(10) NULL,
    ADD COLUMN `issueIdentifier` VARCHAR(20) NULL,
    ADD COLUMN `pageRange` VARCHAR(20) NULL,
    ADD COLUMN `page_range` VARCHAR(20) NULL,
    ADD COLUMN `publicationName` VARCHAR(500) NULL,
    ADD COLUMN `publish_month` VARCHAR(8) NULL,
    ADD COLUMN `publish_year` DOUBLE NULL,
    ADD COLUMN `source_id` DOUBLE NULL,
    ADD COLUMN `source_title` VARCHAR(255) NULL,
    ADD COLUMN `volume` VARCHAR(100) NULL,
    MODIFY `title` VARCHAR(1000) NULL,
    MODIFY `pdf_link` VARCHAR(300) NULL;

-- AlterTable
ALTER TABLE `paper_professor` DROP COLUMN `professor_name`,
    DROP COLUMN `professor_name_en`,
    ADD COLUMN `department` VARCHAR(60) NULL,
    ADD COLUMN `first_conference_title` VARCHAR(255) NULL,
    ADD COLUMN `first_journal_title` VARCHAR(255) NULL,
    ADD COLUMN `lab_link` VARCHAR(255) NULL,
    ADD COLUMN `orcid_id` VARCHAR(20) NULL,
    ADD COLUMN `prof_name` VARCHAR(255) NULL,
    ADD COLUMN `rid` VARCHAR(20) NULL;
