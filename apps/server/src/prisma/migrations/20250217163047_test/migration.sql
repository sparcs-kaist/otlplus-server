-- AlterTable
ALTER TABLE `sync_history` MODIFY `endTime` DATETIME(3) NULL,
    MODIFY `data` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `personal_block` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(20) NOT NULL,
    `place` VARCHAR(100) NULL,
    `description` VARCHAR(100) NULL,
    `color` INTEGER NOT NULL,
    `timetable_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_timeblock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` INTEGER NULL,
    `weekday` INTEGER NULL,
    `time_index` INTEGER NOT NULL,
    `personal_block_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `begin` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,
    `title` VARCHAR(20) NOT NULL,
    `leader_user_id` INTEGER NOT NULL,
    `max_member` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_group_day` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_group_id` INTEGER NOT NULL,
    `day` INTEGER NULL,
    `weekday` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_group_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `student_number` VARCHAR(10) NOT NULL,
    `name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_member_timeblock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_member_id` INTEGER NOT NULL,
    `day` INTEGER NULL,
    `weekday` INTEGER NULL,
    `is_available` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_group_id` INTEGER NOT NULL,
    `place` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `color` INTEGER NOT NULL,

    UNIQUE INDEX `meeting_result_meeting_group_id_key`(`meeting_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_result_timeblock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_result_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `weekday` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friend_friend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `friend_id` INTEGER NOT NULL,
    `is_favorite` BOOLEAN NOT NULL,

    UNIQUE INDEX `friend_friend_user_id_friend_id_key`(`user_id`, `friend_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `personal_block` ADD CONSTRAINT `personal_block_user_id_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `personal_block` ADD CONSTRAINT `personal_block_timetable_id_fk_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetable_timetable`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `personal_timeblock` ADD CONSTRAINT `personal_timeblock_personal_block_id_fk_personal_block_id` FOREIGN KEY (`personal_block_id`) REFERENCES `personal_block`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_group` ADD CONSTRAINT `meeting_group_leader_user_id_fk_session_userprofile_id` FOREIGN KEY (`leader_user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_group_day` ADD CONSTRAINT `meeting_group_day_meeting_group_id_fk_meeting_group_id` FOREIGN KEY (`meeting_group_id`) REFERENCES `meeting_group`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_member` ADD CONSTRAINT `meeting_member_meeting_group_id_fk_meeting_group_id` FOREIGN KEY (`meeting_group_id`) REFERENCES `meeting_group`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_member` ADD CONSTRAINT `meeting_member_user_id_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_member_timeblock` ADD CONSTRAINT `meeting_member_timeblock_meeting_member_id_fk_meeting_member_id` FOREIGN KEY (`meeting_member_id`) REFERENCES `meeting_member`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_result` ADD CONSTRAINT `meeting_result_meeting_group_id_fk_meeting_group_id` FOREIGN KEY (`meeting_group_id`) REFERENCES `meeting_group`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meeting_result_timeblock` ADD CONSTRAINT `meeting_result_timeblock_meeting_result_id_fk_meeting_result_id` FOREIGN KEY (`meeting_result_id`) REFERENCES `meeting_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `friend_friend` ADD CONSTRAINT `friend_relation_user_id_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `friend_friend` ADD CONSTRAINT `friend_relation_friend_id_fk_session_userprofile_id` FOREIGN KEY (`friend_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
