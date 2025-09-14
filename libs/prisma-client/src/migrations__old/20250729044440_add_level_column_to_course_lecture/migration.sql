-- AlterTable
ALTER TABLE subject_course ADD level VARCHAR(20) AS (SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1)) STORED;


-- AlterTable
alter table subject_lecture add level varchar(20) as (SUBSTRING(REGEXP_REPLACE(new_code, '[^0-9]', ''), 1, 1)) stored;


