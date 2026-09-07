-- CreateTable
CREATE TABLE `session_userprofile_friends` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `friend_userprofile_id` INTEGER NOT NULL,
    `is_favorite` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `session_friend_owner_target_uniq`(`userprofile_id`, `friend_userprofile_id`),
    INDEX `session_friend_target_idx`(`friend_userprofile_id`),
    INDEX `session_friend_sort_idx`(`userprofile_id`, `is_favorite`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session_userprofile_friends`
    ADD CONSTRAINT `session_friend_owner_fk`
    FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_friends`
    ADD CONSTRAINT `session_friend_target_fk`
    FOREIGN KEY (`friend_userprofile_id`) REFERENCES `session_userprofile`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT;
