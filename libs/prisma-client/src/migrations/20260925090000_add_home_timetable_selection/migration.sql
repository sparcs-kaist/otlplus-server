CREATE TABLE `timetable_home_selection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `timetable_id` INTEGER NULL,

    UNIQUE INDEX `timetable_home_selection_user_term_key` (`user_id`, `year`, `semester`),
    INDEX `timetable_home_selection_timetable_idx` (`timetable_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `timetable_home_selection_user_fk` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT `timetable_home_selection_timetable_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetable_timetable` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
