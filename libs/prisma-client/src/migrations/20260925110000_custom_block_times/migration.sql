-- Preserve parent day/begin/end for old clients. Existing rows need no backfill.
CREATE TABLE `block_custom_block_times` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `custom_block_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `begin` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,
    INDEX `block_custom_block_times_custom_block_id_idx` (`custom_block_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_block_custom_block_times_block` FOREIGN KEY (`custom_block_id`) REFERENCES `block_custom_blocks` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
