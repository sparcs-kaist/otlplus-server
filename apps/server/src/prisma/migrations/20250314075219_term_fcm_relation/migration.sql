-- CreateTable
CREATE TABLE `session_userprofile_fcm_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,

    INDEX `session_fcm_token_token_index`(`token`),
    UNIQUE INDEX `session_fcm_token_userprofile_id_token_uniq`(`userprofile_id`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_term` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `term_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_agreed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `session_userprofile_term_term_id_fkey`(`term_id`),
    UNIQUE INDEX `session_userprofile_term_userprofile_id_term_id_uniq`(`userprofile_id`, `term_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_term` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `term_name` VARCHAR(200) NOT NULL,
    `term_content` TEXT NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session_userprofile_fcm_token` ADD CONSTRAINT `session_userprofile_fcm_token_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_term` ADD CONSTRAINT `session_userprofile_term_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_term` ADD CONSTRAINT `session_userprofile_term_term_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `session_term`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Insert basic agreement term when migration