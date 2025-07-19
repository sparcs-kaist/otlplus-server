-- AlterTable
ALTER TABLE `sync_history` MODIFY `data` VARCHAR(500) NULL;

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
CREATE TABLE `session_userprofile_agreement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `agreement_id` INTEGER NOT NULL,
    `agreement_status` BOOLEAN NOT NULL DEFAULT false,
    `need_to_show` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `session_userprofile_agreement_agreement_id_fkey`(`agreement_id`),
    INDEX `session_userprofile_agreement_userprofile_id_agreement_id_index`(`userprofile_id`, `agreement_id`),
    UNIQUE INDEX `session_userprofile_agreement_userprofile_id_agreement_id_uniq`(`userprofile_id`, `agreement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('INFO', 'MARKETING', 'NIGHT_MARKETING') NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `session_userprofile_agreement_name_uniq`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `notification_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_agreed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `session_userprofile_notification_notification_id_fkey`(`notification_id`),
    UNIQUE INDEX `session_userprofile_notification_id_uniq`(`userprofile_id`, `notification_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `subject_lecture_deleted_year_semester_index` ON `subject_lecture`(`year`, `semester`, `deleted`);

-- AddForeignKey
ALTER TABLE `session_userprofile_fcm_token` ADD CONSTRAINT `session_userprofile_fcm_token_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_agreement` ADD CONSTRAINT `session_userprofile_agreement_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_agreement` ADD CONSTRAINT `session_userprofile_agreement_agreement_id_fkey` FOREIGN KEY (`agreement_id`) REFERENCES `agreement`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_notification` ADD CONSTRAINT `session_userprofile_notification_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_notification` ADD CONSTRAINT `session_userprofile_notification_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notification`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
