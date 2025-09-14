-- DropForeignKey
ALTER TABLE `planner_arbitraryplanneritem` DROP FOREIGN KEY `planner_arbitrarypla_department_id_0dc7ce25_fk_subject_d`;

-- DropForeignKey
ALTER TABLE `planner_arbitraryplanneritem` DROP FOREIGN KEY `planner_arbitrarypla_planner_id_d6069d2c_fk_planner_p`;

-- DropForeignKey
ALTER TABLE `planner_futureplanneritem` DROP FOREIGN KEY `planner_futureplanne_course_id_b1a06444_fk_subject_c`;

-- DropForeignKey
ALTER TABLE `planner_futureplanneritem` DROP FOREIGN KEY `planner_futureplanne_planner_id_dfd70193_fk_planner_p`;

-- DropForeignKey
ALTER TABLE `planner_planner_additional_tracks` DROP FOREIGN KEY `planner_planner_addi_additionaltrack_id_c46b8c4e_fk_graduatio`;

-- DropForeignKey
ALTER TABLE `planner_planner_additional_tracks` DROP FOREIGN KEY `planner_planner_addi_planner_id_e439a309_fk_planner_p`;

-- DropForeignKey
ALTER TABLE `planner_takenplanneritem` DROP FOREIGN KEY `planner_takenplanner_lecture_id_9b2d30d8_fk_subject_l`;

-- DropForeignKey
ALTER TABLE `planner_takenplanneritem` DROP FOREIGN KEY `planner_takenplanner_planner_id_b725ff83_fk_planner_p`;

-- AlterTable
ALTER TABLE `subject_course` MODIFY `title_no_space` VARCHAR(100) NOT NULL,
    MODIFY `title_en_no_space` VARCHAR(200) NOT NULL,
    MODIFY `level` VARCHAR(20) NULL DEFAULT SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);

-- AlterTable
ALTER TABLE `subject_lecture` MODIFY `title_no_space` VARCHAR(100) NOT NULL,
    MODIFY `title_en_no_space` VARCHAR(200) NOT NULL,
    MODIFY `level` VARCHAR(20) NULL DEFAULT SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1);

-- CreateTable
CREATE TABLE `sid_uid_map` (
    `uid` INTEGER NOT NULL,
    `sid` INTEGER NOT NULL,

    PRIMARY KEY (`uid`, `sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `planner_arbitraryplanneritem` ADD CONSTRAINT `planner_arbitrarypla_department_id_0dc7ce25_fk_subject_d` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_arbitraryplanneritem` ADD CONSTRAINT `planner_arbitrarypla_planner_id_d6069d2c_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_futureplanneritem` ADD CONSTRAINT `planner_futureplanne_course_id_b1a06444_fk_subject_c` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_futureplanneritem` ADD CONSTRAINT `planner_futureplanne_planner_id_dfd70193_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_planner_additional_tracks` ADD CONSTRAINT `planner_planner_addi_additionaltrack_id_c46b8c4e_fk_graduatio` FOREIGN KEY (`additionaltrack_id`) REFERENCES `graduation_additionaltrack`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_planner_additional_tracks` ADD CONSTRAINT `planner_planner_addi_planner_id_e439a309_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_takenplanneritem` ADD CONSTRAINT `planner_takenplanner_lecture_id_9b2d30d8_fk_subject_l` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `planner_takenplanneritem` ADD CONSTRAINT `planner_takenplanner_planner_id_b725ff83_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

