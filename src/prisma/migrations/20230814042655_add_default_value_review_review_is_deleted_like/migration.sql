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
