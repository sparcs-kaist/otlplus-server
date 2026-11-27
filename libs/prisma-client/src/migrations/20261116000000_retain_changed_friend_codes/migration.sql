ALTER TABLE `session_userprofile_friend_codes`
    ADD COLUMN `is_changed` BOOLEAN NOT NULL DEFAULT false,
    ADD INDEX `session_friend_code_owner_changed_idx` (`userprofile_id`, `is_changed`),
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`code`),
    DROP INDEX `session_friend_code_uniq`;
