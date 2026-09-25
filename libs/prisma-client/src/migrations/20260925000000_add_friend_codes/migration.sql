-- CreateTable
CREATE TABLE `session_userprofile_friend_codes` (
    `userprofile_id` INTEGER NOT NULL,
    `code` VARCHAR(6) NOT NULL,

    UNIQUE INDEX `session_friend_code_uniq`(`code`),
    PRIMARY KEY (`userprofile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session_userprofile_friend_codes`
    ADD CONSTRAINT `session_friend_code_owner_fk`
    FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT;
