-- AlterTable
ALTER TABLE `timetable_timetable` ADD COLUMN `name` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `timetable_timetable_user_name_index` ON `timetable_timetable`(`user_id`, `name`);
