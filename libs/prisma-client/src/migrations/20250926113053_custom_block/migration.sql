-- AlterTable
-- AlterTable
ALTER TABLE `subject_course` MODIFY `level` VARCHAR(20) NULL;
UPDATE `subject_course` SET level = SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);
-- AlterTable
ALTER TABLE `subject_lecture` MODIFY `level` VARCHAR(20) NULL;
UPDATE `subject_lecture` SET level = SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);

-- CreateTable
CREATE TABLE `block_custom_blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `block_name` VARCHAR(255) NOT NULL,
    `place` VARCHAR(255) NOT NULL,
    `day` INTEGER NOT NULL,
    `begin` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_timetable_customblocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timetable_id` INTEGER NOT NULL,
    `custom_block_id` INTEGER NOT NULL,

    INDEX `timetable_timetable_customblocks_custom_block_id_index`(`custom_block_id`),
    UNIQUE INDEX `timetable_customblocks_mapping_uniq`(`timetable_id`, `custom_block_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `timetable_timetable_customblocks` ADD CONSTRAINT `fk_timetable_timetable_custom__block_custom_blocks` FOREIGN KEY (`custom_block_id`) REFERENCES `block_custom_blocks`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_timetable_customblocks` ADD CONSTRAINT `fk_timetable_timetable_custom__timetable_timetable` FOREIGN KEY (`timetable_id`) REFERENCES `timetable_timetable`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
