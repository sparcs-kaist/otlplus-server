CREATE TABLE `session_auth_session` (
    `id` CHAR(36) NOT NULL,
    `userprofile_id` INTEGER NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `issued_at` DATETIME(0) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `revoked_at` DATETIME(0) NULL,

    INDEX `session_auth_owner_idx` (`userprofile_id`),
    INDEX `session_auth_expiry_idx` (`expires_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `session_auth_owner_fk` FOREIGN KEY (`userprofile_id`)
        REFERENCES `session_userprofile` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
