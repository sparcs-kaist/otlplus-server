-- Step 1: 컬럼을 NULL 허용으로 추가
ALTER TABLE `subject_course` ADD COLUMN `new_code` VARCHAR(20) NULL;
ALTER TABLE `subject_lecture` ADD COLUMN `new_code` VARCHAR(20) NULL;

-- Step 2: `old_code` 값을 `new_code`로 복사
UPDATE `subject_course` SET `new_code` = `old_code`;
UPDATE `subject_lecture` SET `new_code` = `old_code`;

-- Step 3: `new_code` 컬럼을 NOT NULL로 변경
ALTER TABLE `subject_course` MODIFY COLUMN `new_code` VARCHAR(20) NOT NULL;
ALTER TABLE `subject_lecture` MODIFY COLUMN `new_code` VARCHAR(20) NOT NULL;
