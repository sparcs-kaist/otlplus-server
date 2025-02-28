-- DropForeignKey
ALTER TABLE `paper` DROP FOREIGN KEY `paper_professor_id_fkey`;

-- DropIndex
DROP INDEX `paper_professor_id_fkey` ON `paper`;

-- AlterTable
ALTER TABLE `paper` MODIFY `professor_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `paper_professor`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
