-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('DEPARTMENT', 'COURSE', 'LECTURE', 'PROFESSOR', 'MAJORS', 'DEGREE', 'EXAMTIME', 'CLASSTIME', 'TAKEN_LECTURES', 'CHARGE');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('INFO', 'MARKETING', 'NIGHT_MARKETING');

-- CreateTable
CREATE TABLE "auth_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "auth_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group_permissions" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content_type_id" INTEGER NOT NULL,
    "codename" VARCHAR(100) NOT NULL,

    CONSTRAINT "auth_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" SERIAL NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "last_login" TIMESTAMP(0),
    "is_superuser" BOOLEAN NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "first_name" VARCHAR(30) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "is_staff" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "date_joined" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user_groups" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "auth_user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user_user_permissions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_user_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_custom_blocks" (
    "id" SERIAL NOT NULL,
    "block_name" VARCHAR(255) NOT NULL,
    "place" VARCHAR(255) NOT NULL,
    "day" INTEGER NOT NULL,
    "begin" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,

    CONSTRAINT "block_custom_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_admin_log" (
    "id" SERIAL NOT NULL,
    "action_time" TIMESTAMP(0) NOT NULL,
    "object_id" TEXT,
    "object_repr" VARCHAR(200) NOT NULL,
    "action_flag" SMALLINT NOT NULL,
    "change_message" TEXT NOT NULL,
    "content_type_id" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "django_admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_content_type" (
    "id" SERIAL NOT NULL,
    "app_label" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,

    CONSTRAINT "django_content_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_migrations" (
    "id" SERIAL NOT NULL,
    "app" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "applied" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "django_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_session" (
    "session_key" VARCHAR(40) NOT NULL,
    "session_data" TEXT NOT NULL,
    "expire_date" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "django_session_pkey" PRIMARY KEY ("session_key")
);

-- CreateTable
CREATE TABLE "main_famoushumanityreviewdailyfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "main_famoushumanityreviewdailyfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_famoushumanityreviewdailyfeed_reviews" (
    "id" SERIAL NOT NULL,
    "famoushumanityreviewdailyfeed_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "main_famoushumanityreviewdailyfeed_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_famousmajorreviewdailyfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "department_id" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "main_famousmajorreviewdailyfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_famousmajorreviewdailyfeed_reviews" (
    "id" SERIAL NOT NULL,
    "famousmajorreviewdailyfeed_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "main_famousmajorreviewdailyfeed_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_rankedreviewdailyfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "semester_id" INTEGER,

    CONSTRAINT "main_rankedreviewdailyfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_ratedailyuserfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "main_ratedailyuserfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_relatedcoursedailyuserfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "main_relatedcoursedailyuserfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_reviewwritedailyuserfeed" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "main_reviewwritedailyuserfeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_humanitybestreview" (
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "review_humanitybestreview_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "review_majorbestreview" (
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "review_majorbestreview_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "review_review" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "grade" SMALLINT NOT NULL DEFAULT 0,
    "load" SMALLINT NOT NULL DEFAULT 0,
    "speech" SMALLINT NOT NULL DEFAULT 0,
    "writer_id" INTEGER,
    "writer_label" VARCHAR(200) NOT NULL,
    "updated_datetime" TIMESTAMP(0) NOT NULL,
    "like" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "written_datetime" TIMESTAMP(0),

    CONSTRAINT "review_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_reviewvote" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "userprofile_id" INTEGER,
    "created_datetime" TIMESTAMP(6),

    CONSTRAINT "review_reviewvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "student_id" VARCHAR(10) NOT NULL,
    "sid" VARCHAR(30) NOT NULL,
    "language" VARCHAR(15),
    "portal_check" INTEGER DEFAULT 0,
    "department_id" INTEGER,
    "email" VARCHAR(255),
    "date_joined" TIMESTAMP(0) NOT NULL,
    "first_name" VARCHAR(30) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "degree" VARCHAR(100),
    "refresh_token" VARCHAR(255),
    "kaist_id" VARCHAR(30),
    "last_login" TIMESTAMP(0),
    "status" VARCHAR(30),
    "uid" VARCHAR(30),

    CONSTRAINT "session_userprofile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sid_uid_map" (
    "uid" TEXT NOT NULL,
    "sid" TEXT NOT NULL,

    CONSTRAINT "sid_uid_map_pkey" PRIMARY KEY ("uid","sid")
);

-- CreateTable
CREATE TABLE "session_userprofile_device" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "deviceType" "DeviceType",
    "deviceOsVersion" VARCHAR(255),
    "appVersion" VARCHAR(255),

    CONSTRAINT "session_userprofile_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_agreement" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "agreement_id" INTEGER NOT NULL,
    "agreement_status" BOOLEAN NOT NULL DEFAULT false,
    "need_to_show" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_userprofile_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement" (
    "id" SERIAL NOT NULL,
    "name" "AgreementType" NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_notification" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_userprofile_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agreementType" "AgreementType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_notification_history" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "notification_req_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(0),
    "content" TEXT NOT NULL,
    "fcm_id" TEXT,
    "to" TEXT,

    CONSTRAINT "session_userprofile_notification_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_favorite_departments" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "session_userprofile_favorite_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_majors" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "session_userprofile_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_minors" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "session_userprofile_minors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_specialized_major" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "session_userprofile_specialized_major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_userprofile_taken_lectures" (
    "id" SERIAL NOT NULL,
    "userprofile_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "session_userprofile_taken_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_classtime" (
    "id" SERIAL NOT NULL,
    "day" SMALLINT NOT NULL,
    "begin" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,
    "type" VARCHAR(1) NOT NULL,
    "building_id" VARCHAR(10),
    "building_full_name" VARCHAR(60),
    "building_full_name_en" VARCHAR(60),
    "room_name" VARCHAR(40),
    "unit_time" SMALLINT,
    "lecture_id" INTEGER,

    CONSTRAINT "subject_classtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_course" (
    "id" SERIAL NOT NULL,
    "old_code" VARCHAR(10) NOT NULL,
    "department_id" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "type_en" VARCHAR(60) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "title_en" VARCHAR(200) NOT NULL,
    "summury" VARCHAR(400) NOT NULL,
    "grade_sum" DOUBLE PRECISION NOT NULL,
    "load_sum" DOUBLE PRECISION NOT NULL,
    "speech_sum" DOUBLE PRECISION NOT NULL,
    "review_total_weight" DOUBLE PRECISION NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "speech" DOUBLE PRECISION NOT NULL,
    "latest_written_datetime" TIMESTAMP(0),
    "title_no_space" VARCHAR(100) GENERATED ALWAYS AS (regexp_replace("title", '[[:space:]]', '', 'g')) STORED NOT NULL,
    "title_en_no_space" VARCHAR(200) GENERATED ALWAYS AS (regexp_replace("title_en", '[[:space:]]', '', 'g')) STORED NOT NULL,
    "new_code" VARCHAR(20) NOT NULL,
    "representative_lecture_id" INTEGER NOT NULL DEFAULT 0,
    "level" VARCHAR(20) GENERATED ALWAYS AS (substr(regexp_replace("new_code", '[^0-9]', '', 'g'), 1, 1)) STORED,

    CONSTRAINT "subject_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_course_professors" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "professor_id" INTEGER NOT NULL,

    CONSTRAINT "subject_course_professors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_course_related_courses_posterior" (
    "id" SERIAL NOT NULL,
    "from_course_id" INTEGER NOT NULL,
    "to_course_id" INTEGER NOT NULL,

    CONSTRAINT "subject_course_related_courses_posterior_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_course_related_courses_prior" (
    "id" SERIAL NOT NULL,
    "from_course_id" INTEGER NOT NULL,
    "to_course_id" INTEGER NOT NULL,

    CONSTRAINT "subject_course_related_courses_prior_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_courseuser" (
    "id" SERIAL NOT NULL,
    "latest_read_datetime" TIMESTAMP(0) NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_profile_id" INTEGER NOT NULL,

    CONSTRAINT "subject_courseuser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_department" (
    "id" INTEGER NOT NULL,
    "num_id" VARCHAR(4) NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "name_en" VARCHAR(100),
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "subject_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_examtime" (
    "id" SERIAL NOT NULL,
    "day" SMALLINT NOT NULL,
    "begin" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "subject_examtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_lecture" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "old_code" VARCHAR(10) NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" SMALLINT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "class_no" VARCHAR(4) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "title_en" VARCHAR(200) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "type_en" VARCHAR(60) NOT NULL,
    "audience" INTEGER NOT NULL,
    "credit" INTEGER NOT NULL,
    "num_classes" INTEGER NOT NULL,
    "num_labs" INTEGER NOT NULL,
    "credit_au" INTEGER NOT NULL,
    "limit" INTEGER NOT NULL,
    "num_people" INTEGER,
    "is_english" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "course_id" INTEGER NOT NULL,
    "grade_sum" DOUBLE PRECISION NOT NULL,
    "load_sum" DOUBLE PRECISION NOT NULL,
    "speech_sum" DOUBLE PRECISION NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "speech" DOUBLE PRECISION NOT NULL,
    "review_total_weight" DOUBLE PRECISION NOT NULL,
    "class_title" VARCHAR(100),
    "class_title_en" VARCHAR(100),
    "common_title" VARCHAR(100),
    "common_title_en" VARCHAR(100),
    "title_no_space" VARCHAR(100) GENERATED ALWAYS AS (regexp_replace("title", '[[:space:]]', '', 'g')) STORED NOT NULL,
    "title_en_no_space" VARCHAR(200) GENERATED ALWAYS AS (regexp_replace("title_en", '[[:space:]]', '', 'g')) STORED NOT NULL,
    "new_code" VARCHAR(20) NOT NULL,
    "level" VARCHAR(20) GENERATED ALWAYS AS (substr(regexp_replace("new_code", '[^0-9]', '', 'g'), 1, 1)) STORED,

    CONSTRAINT "subject_lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_lecture_professors" (
    "id" SERIAL NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "professor_id" INTEGER NOT NULL,

    CONSTRAINT "subject_lecture_professors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_professor" (
    "id" SERIAL NOT NULL,
    "professor_name" VARCHAR(100) NOT NULL,
    "professor_name_en" VARCHAR(100),
    "professor_id" INTEGER NOT NULL,
    "major" VARCHAR(30) NOT NULL,
    "grade_sum" DOUBLE PRECISION NOT NULL,
    "load_sum" DOUBLE PRECISION NOT NULL,
    "speech_sum" DOUBLE PRECISION NOT NULL,
    "review_total_weight" DOUBLE PRECISION NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "speech" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "subject_professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_semester" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "beginning" TIMESTAMP(0) NOT NULL,
    "end" TIMESTAMP(0) NOT NULL,
    "courseRegistrationPeriodStart" TIMESTAMP(0),
    "courseRegistrationPeriodEnd" TIMESTAMP(0),
    "courseAddDropPeriodEnd" TIMESTAMP(0),
    "courseDropDeadline" TIMESTAMP(0),
    "courseEvaluationDeadline" TIMESTAMP(0),
    "gradePosting" TIMESTAMP(0),
    "courseDesciptionSubmission" TIMESTAMP(0),

    CONSTRAINT "subject_semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_notice" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(0) NOT NULL,
    "end_time" TIMESTAMP(0) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "support_notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_rate" (
    "id" SERIAL NOT NULL,
    "score" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "created_datetime" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "version" VARCHAR(20) NOT NULL,

    CONSTRAINT "support_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_oldtimetable" (
    "id" SERIAL NOT NULL,
    "student_id" VARCHAR(10) NOT NULL,
    "year" INTEGER,
    "semester" SMALLINT,
    "table_no" SMALLINT,

    CONSTRAINT "timetable_oldtimetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_oldtimetable_lectures" (
    "id" SERIAL NOT NULL,
    "oldtimetable_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "timetable_oldtimetable_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_timetable" (
    "id" SERIAL NOT NULL,
    "year" INTEGER,
    "semester" SMALLINT,
    "user_id" INTEGER NOT NULL,
    "arrange_order" SMALLINT NOT NULL,
    "name" VARCHAR(255),

    CONSTRAINT "timetable_timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_timetable_lectures" (
    "id" SERIAL NOT NULL,
    "timetable_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "timetable_timetable_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_timetable_customblocks" (
    "id" SERIAL NOT NULL,
    "timetable_id" INTEGER NOT NULL,
    "custom_block_id" INTEGER NOT NULL,

    CONSTRAINT "timetable_timetable_customblocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_wishlist" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "timetable_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_wishlist_lectures" (
    "id" SERIAL NOT NULL,
    "wishlist_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "timetable_wishlist_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_additionaltrack" (
    "id" SERIAL NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "major_required" INTEGER NOT NULL,
    "major_elective" INTEGER NOT NULL,
    "department_id" INTEGER,

    CONSTRAINT "graduation_additionaltrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_generaltrack" (
    "id" SERIAL NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "is_foreign" BOOLEAN NOT NULL,
    "total_credit" INTEGER NOT NULL,
    "total_au" INTEGER NOT NULL,
    "basic_required" INTEGER NOT NULL,
    "basic_elective" INTEGER NOT NULL,
    "thesis_study" INTEGER NOT NULL,
    "thesis_study_doublemajor" INTEGER NOT NULL,
    "general_required_credit" INTEGER NOT NULL,
    "general_required_au" INTEGER NOT NULL,
    "humanities" INTEGER NOT NULL,
    "humanities_doublemajor" INTEGER NOT NULL,

    CONSTRAINT "graduation_generaltrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_majortrack" (
    "id" SERIAL NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "basic_elective_doublemajor" INTEGER NOT NULL,
    "major_required" INTEGER NOT NULL,
    "major_elective" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "graduation_majortrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planner_arbitraryplanneritem" (
    "id" SERIAL NOT NULL,
    "is_excluded" BOOLEAN NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "type" VARCHAR(12) NOT NULL,
    "type_en" VARCHAR(36) NOT NULL,
    "credit" INTEGER NOT NULL,
    "credit_au" INTEGER NOT NULL,
    "department_id" INTEGER,
    "planner_id" INTEGER NOT NULL,

    CONSTRAINT "planner_arbitraryplanneritem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planner_futureplanneritem" (
    "id" SERIAL NOT NULL,
    "is_excluded" BOOLEAN NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "planner_id" INTEGER NOT NULL,

    CONSTRAINT "planner_futureplanneritem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planner_planner" (
    "id" SERIAL NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "arrange_order" SMALLINT NOT NULL,
    "general_track_id" INTEGER NOT NULL,
    "major_track_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "planner_planner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planner_planner_additional_tracks" (
    "id" SERIAL NOT NULL,
    "planner_id" INTEGER NOT NULL,
    "additionaltrack_id" INTEGER NOT NULL,

    CONSTRAINT "planner_planner_additional_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planner_takenplanneritem" (
    "id" SERIAL NOT NULL,
    "is_excluded" BOOLEAN NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "planner_id" INTEGER NOT NULL,

    CONSTRAINT "planner_takenplanneritem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_professor_course_list" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "subject_professor_course_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_taken_lectures" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,

    CONSTRAINT "sync_taken_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_history" (
    "id" SERIAL NOT NULL,
    "type" "SyncType" NOT NULL,
    "startTime" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "data" VARCHAR(500),
    "year" INTEGER,
    "semester" INTEGER,

    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_prof_to_subject_prof" (
    "id" SERIAL NOT NULL,
    "subject_professor_id" INTEGER NOT NULL,
    "paper_professor_id" INTEGER NOT NULL,

    CONSTRAINT "paper_prof_to_subject_prof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_professor_department" (
    "id" SERIAL NOT NULL,
    "paper_professor_id" INTEGER NOT NULL,
    "subject_department_id" INTEGER NOT NULL,

    CONSTRAINT "paper_professor_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_professor" (
    "id" SERIAL NOT NULL,
    "department" VARCHAR(60),
    "first_conference_title" VARCHAR(255),
    "first_journal_title" VARCHAR(255),
    "lab_link" VARCHAR(255),
    "orcid_id" VARCHAR(20),
    "prof_name" VARCHAR(255),
    "rid" VARCHAR(20),

    CONSTRAINT "paper_professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER,
    "title" VARCHAR(1000),
    "abstract" TEXT,
    "keywords" TEXT,
    "doi" VARCHAR(100),
    "pdf_link" VARCHAR(300),
    "xml_link" VARCHAR(255),
    "aggregationType" VARCHAR(30),
    "article_number" VARCHAR(50),
    "cited_count" DOUBLE PRECISION,
    "citedby_count" DOUBLE PRECISION,
    "coverDate" DATE,
    "coverDisplayDate" VARCHAR(100),
    "description" TEXT,
    "eIssn" VARCHAR(10),
    "issn" VARCHAR(10),
    "issueIdentifier" VARCHAR(20),
    "pageRange" VARCHAR(20),
    "page_range" VARCHAR(20),
    "publicationName" VARCHAR(500),
    "publish_month" VARCHAR(8),
    "publish_year" DOUBLE PRECISION,
    "source_id" DOUBLE PRECISION,
    "source_title" VARCHAR(255),
    "volume" VARCHAR(100),

    CONSTRAINT "paper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_name_key" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_permissions_permission_id_idx" ON "auth_group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_key" ON "auth_group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_key" ON "auth_permission"("content_type_id", "codename");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_username_key" ON "auth_user"("username");

-- CreateIndex
CREATE INDEX "auth_user_groups_group_id_idx" ON "auth_user_groups"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_groups_user_id_group_id_key" ON "auth_user_groups"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "auth_user_user_permissions_permission_id_idx" ON "auth_user_user_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_user_permissions_user_id_permission_id_key" ON "auth_user_user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "django_admin_log_content_type_id_idx" ON "django_admin_log"("content_type_id");

-- CreateIndex
CREATE INDEX "django_admin_log_user_id_idx" ON "django_admin_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "django_content_type_app_label_model_key" ON "django_content_type"("app_label", "model");

-- CreateIndex
CREATE INDEX "django_session_expire_date_idx" ON "django_session"("expire_date");

-- CreateIndex
CREATE UNIQUE INDEX "main_famoushumanityreviewdailyfeed_date_key" ON "main_famoushumanityreviewdailyfeed"("date");

-- CreateIndex
CREATE INDEX "main_famoushumanityreviewdailyfeed_reviews_review_id_idx" ON "main_famoushumanityreviewdailyfeed_reviews"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_famoushumanityreviewdailyfeed_reviews_famoushumanityre_key" ON "main_famoushumanityreviewdailyfeed_reviews"("famoushumanityreviewdailyfeed_id", "review_id");

-- CreateIndex
CREATE INDEX "main_famousmajorreviewdailyfeed_department_id_idx" ON "main_famousmajorreviewdailyfeed"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_famousmajorreviewdailyfeed_date_department_id_key" ON "main_famousmajorreviewdailyfeed"("date", "department_id");

-- CreateIndex
CREATE INDEX "main_famousmajorreviewdailyfeed_reviews_review_id_idx" ON "main_famousmajorreviewdailyfeed_reviews"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_famousmajorreviewdailyfeed_reviews_famousmajorreviewda_key" ON "main_famousmajorreviewdailyfeed_reviews"("famousmajorreviewdailyfeed_id", "review_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_rankedreviewdailyfeed_date_key" ON "main_rankedreviewdailyfeed"("date");

-- CreateIndex
CREATE INDEX "main_rankedreviewdailyfeed_semester_id_idx" ON "main_rankedreviewdailyfeed"("semester_id");

-- CreateIndex
CREATE INDEX "main_ratedailyuserfeed_user_id_idx" ON "main_ratedailyuserfeed"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_ratedailyuserfeed_date_user_id_key" ON "main_ratedailyuserfeed"("date", "user_id");

-- CreateIndex
CREATE INDEX "main_relatedcoursedailyuserfeed_course_id_idx" ON "main_relatedcoursedailyuserfeed"("course_id");

-- CreateIndex
CREATE INDEX "main_relatedcoursedailyuserfeed_user_id_idx" ON "main_relatedcoursedailyuserfeed"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_relatedcoursedailyuserfeed_date_user_id_key" ON "main_relatedcoursedailyuserfeed"("date", "user_id");

-- CreateIndex
CREATE INDEX "main_reviewwritedailyuserfeed_lecture_id_idx" ON "main_reviewwritedailyuserfeed"("lecture_id");

-- CreateIndex
CREATE INDEX "main_reviewwritedailyuserfeed_user_id_idx" ON "main_reviewwritedailyuserfeed"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_reviewwritedailyuserfeed_date_user_id_key" ON "main_reviewwritedailyuserfeed"("date", "user_id");

-- CreateIndex
CREATE INDEX "review_review_written_datetime_idx" ON "review_review"("written_datetime");

-- CreateIndex
CREATE INDEX "review_review_course_id_idx" ON "review_review"("course_id");

-- CreateIndex
CREATE INDEX "review_review_lecture_id_idx" ON "review_review"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_review_writer_id_lecture_id_key" ON "review_review"("writer_id", "lecture_id");

-- CreateIndex
CREATE INDEX "review_reviewvote_created_datetime_idx" ON "review_reviewvote"("created_datetime");

-- CreateIndex
CREATE INDEX "review_reviewvote_userprofile_id_idx" ON "review_reviewvote"("userprofile_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_reviewvote_review_id_userprofile_id_key" ON "review_reviewvote"("review_id", "userprofile_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_user_id_key" ON "session_userprofile"("user_id");

-- CreateIndex
CREATE INDEX "session_userprofile_department_id_idx" ON "session_userprofile"("department_id");

-- CreateIndex
CREATE INDEX "session_userprofile_student_id_idx" ON "session_userprofile"("student_id");

-- CreateIndex
CREATE INDEX "session_userprofile_device_token_idx" ON "session_userprofile_device"("token");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_device_userprofile_id_token_key" ON "session_userprofile_device"("userprofile_id", "token");

-- CreateIndex
CREATE INDEX "session_userprofile_agreement_agreement_id_idx" ON "session_userprofile_agreement"("agreement_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_agreement_userprofile_id_agreement_id_key" ON "session_userprofile_agreement"("userprofile_id", "agreement_id");

-- CreateIndex
CREATE UNIQUE INDEX "agreement_name_key" ON "agreement"("name");

-- CreateIndex
CREATE INDEX "session_userprofile_notification_notification_id_idx" ON "session_userprofile_notification"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_notification_userprofile_id_notificatio_key" ON "session_userprofile_notification"("userprofile_id", "notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_name_key" ON "notification"("name");

-- CreateIndex
CREATE INDEX "session_userprofile_notification_history_notification_id_idx" ON "session_userprofile_notification_history"("notification_id");

-- CreateIndex
CREATE INDEX "session_userprofile_notification_history_userprofile_id_idx" ON "session_userprofile_notification_history"("userprofile_id");

-- CreateIndex
CREATE INDEX "session_userprofile_favorite_departments_department_id_idx" ON "session_userprofile_favorite_departments"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_favorite_departments_userprofile_id_dep_key" ON "session_userprofile_favorite_departments"("userprofile_id", "department_id");

-- CreateIndex
CREATE INDEX "session_userprofile_majors_department_id_idx" ON "session_userprofile_majors"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_majors_userprofile_id_department_id_key" ON "session_userprofile_majors"("userprofile_id", "department_id");

-- CreateIndex
CREATE INDEX "session_userprofile_minors_department_id_idx" ON "session_userprofile_minors"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_minors_userprofile_id_department_id_key" ON "session_userprofile_minors"("userprofile_id", "department_id");

-- CreateIndex
CREATE INDEX "session_userprofile_specialized_major_department_id_idx" ON "session_userprofile_specialized_major"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_specialized_major_userprofile_id_depart_key" ON "session_userprofile_specialized_major"("userprofile_id", "department_id");

-- CreateIndex
CREATE INDEX "session_userprofile_taken_lectures_lecture_id_idx" ON "session_userprofile_taken_lectures"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_userprofile_taken_lectures_userprofile_id_lecture_i_key" ON "session_userprofile_taken_lectures"("userprofile_id", "lecture_id");

-- CreateIndex
CREATE INDEX "subject_classtime_lecture_id_idx" ON "subject_classtime"("lecture_id");

-- CreateIndex
CREATE INDEX "subject_course_department_id_idx" ON "subject_course"("department_id");

-- CreateIndex
CREATE INDEX "subject_course_title_en_no_space_idx" ON "subject_course"("title_en_no_space");

-- CreateIndex
CREATE INDEX "subject_course_title_idx" ON "subject_course"("title");

-- CreateIndex
CREATE INDEX "subject_course_title_no_space_idx" ON "subject_course"("title_no_space");

-- CreateIndex
CREATE INDEX "subject_course_title_en_idx" ON "subject_course"("title_en");

-- CreateIndex
CREATE INDEX "subject_course_professors_professor_id_idx" ON "subject_course_professors"("professor_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_course_professors_course_id_professor_id_key" ON "subject_course_professors"("course_id", "professor_id");

-- CreateIndex
CREATE INDEX "subject_course_related_courses_posterior_to_course_id_idx" ON "subject_course_related_courses_posterior"("to_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_course_related_courses_posterior_from_course_id_to__key" ON "subject_course_related_courses_posterior"("from_course_id", "to_course_id");

-- CreateIndex
CREATE INDEX "subject_course_related_courses_prior_to_course_id_idx" ON "subject_course_related_courses_prior"("to_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_course_related_courses_prior_from_course_id_to_cour_key" ON "subject_course_related_courses_prior"("from_course_id", "to_course_id");

-- CreateIndex
CREATE INDEX "subject_courseuser_user_profile_id_idx" ON "subject_courseuser"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_courseuser_course_id_user_profile_id_key" ON "subject_courseuser"("course_id", "user_profile_id");

-- CreateIndex
CREATE INDEX "subject_examtime_lecture_id_idx" ON "subject_examtime"("lecture_id");

-- CreateIndex
CREATE INDEX "subject_lecture_deleted_idx" ON "subject_lecture"("deleted");

-- CreateIndex
CREATE INDEX "subject_lecture_type_en_idx" ON "subject_lecture"("type_en");

-- CreateIndex
CREATE INDEX "subject_lecture_course_id_idx" ON "subject_lecture"("course_id");

-- CreateIndex
CREATE INDEX "subject_lecture_department_id_idx" ON "subject_lecture"("department_id");

-- CreateIndex
CREATE INDEX "subject_lecture_title_en_no_space_idx" ON "subject_lecture"("title_en_no_space");

-- CreateIndex
CREATE INDEX "subject_lecture_title_no_space_idx" ON "subject_lecture"("title_no_space");

-- CreateIndex
CREATE INDEX "subject_lecture_title_en_idx" ON "subject_lecture"("title_en");

-- CreateIndex
CREATE INDEX "subject_lecture_title_idx" ON "subject_lecture"("title");

-- CreateIndex
CREATE INDEX "subject_lecture_year_semester_deleted_idx" ON "subject_lecture"("year", "semester", "deleted");

-- CreateIndex
CREATE INDEX "subject_lecture_semester_year_deleted_type_en_id_idx" ON "subject_lecture"("semester", "year", "deleted", "type_en", "id");

-- CreateIndex
CREATE INDEX "subject_lecture_year_semester_type_en_department_id_deleted_idx" ON "subject_lecture"("year", "semester", "type_en", "department_id", "deleted");

-- CreateIndex
CREATE INDEX "subject_lecture_professors_professor_id_idx" ON "subject_lecture_professors"("professor_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_lecture_professors_lecture_id_professor_id_key" ON "subject_lecture_professors"("lecture_id", "professor_id");

-- CreateIndex
CREATE INDEX "subject_semester_semester_idx" ON "subject_semester"("semester");

-- CreateIndex
CREATE INDEX "subject_semester_year_idx" ON "subject_semester"("year");

-- CreateIndex
CREATE UNIQUE INDEX "subject_semester_year_semester_key" ON "subject_semester"("year", "semester");

-- CreateIndex
CREATE INDEX "support_rate_created_datetime_idx" ON "support_rate"("created_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "support_rate_user_id_year_key" ON "support_rate"("user_id", "year");

-- CreateIndex
CREATE INDEX "timetable_oldtimetable_lectures_lecture_id_idx" ON "timetable_oldtimetable_lectures"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_oldtimetable_lectures_oldtimetable_id_lecture_id_key" ON "timetable_oldtimetable_lectures"("oldtimetable_id", "lecture_id");

-- CreateIndex
CREATE INDEX "timetable_timetable_arrange_order_idx" ON "timetable_timetable"("arrange_order");

-- CreateIndex
CREATE INDEX "timetable_timetable_semester_idx" ON "timetable_timetable"("semester");

-- CreateIndex
CREATE INDEX "timetable_timetable_user_id_idx" ON "timetable_timetable"("user_id");

-- CreateIndex
CREATE INDEX "timetable_timetable_year_idx" ON "timetable_timetable"("year");

-- CreateIndex
CREATE INDEX "timetable_timetable_user_id_name_idx" ON "timetable_timetable"("user_id", "name");

-- CreateIndex
CREATE INDEX "timetable_timetable_lectures_lecture_id_idx" ON "timetable_timetable_lectures"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_timetable_lectures_timetable_id_lecture_id_key" ON "timetable_timetable_lectures"("timetable_id", "lecture_id");

-- CreateIndex
CREATE INDEX "timetable_timetable_customblocks_custom_block_id_idx" ON "timetable_timetable_customblocks"("custom_block_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_timetable_customblocks_timetable_id_custom_block__key" ON "timetable_timetable_customblocks"("timetable_id", "custom_block_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_wishlist_user_id_key" ON "timetable_wishlist"("user_id");

-- CreateIndex
CREATE INDEX "timetable_wishlist_lectures_lecture_id_idx" ON "timetable_wishlist_lectures"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_wishlist_lectures_wishlist_id_lecture_id_key" ON "timetable_wishlist_lectures"("wishlist_id", "lecture_id");

-- CreateIndex
CREATE INDEX "graduation_additionaltrack_department_id_idx" ON "graduation_additionaltrack"("department_id");

-- CreateIndex
CREATE INDEX "graduation_additionaltrack_end_year_idx" ON "graduation_additionaltrack"("end_year");

-- CreateIndex
CREATE INDEX "graduation_additionaltrack_start_year_idx" ON "graduation_additionaltrack"("start_year");

-- CreateIndex
CREATE INDEX "graduation_additionaltrack_type_idx" ON "graduation_additionaltrack"("type");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_additionaltrack_end_year_type_department_id_key" ON "graduation_additionaltrack"("end_year", "type", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_additionaltrack_start_year_type_department_id_key" ON "graduation_additionaltrack"("start_year", "type", "department_id");

-- CreateIndex
CREATE INDEX "graduation_generaltrack_end_year_idx" ON "graduation_generaltrack"("end_year");

-- CreateIndex
CREATE INDEX "graduation_generaltrack_is_foreign_idx" ON "graduation_generaltrack"("is_foreign");

-- CreateIndex
CREATE INDEX "graduation_generaltrack_start_year_idx" ON "graduation_generaltrack"("start_year");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_generaltrack_end_year_is_foreign_key" ON "graduation_generaltrack"("end_year", "is_foreign");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_generaltrack_start_year_is_foreign_key" ON "graduation_generaltrack"("start_year", "is_foreign");

-- CreateIndex
CREATE INDEX "graduation_majortrack_department_id_idx" ON "graduation_majortrack"("department_id");

-- CreateIndex
CREATE INDEX "graduation_majortrack_end_year_idx" ON "graduation_majortrack"("end_year");

-- CreateIndex
CREATE INDEX "graduation_majortrack_start_year_idx" ON "graduation_majortrack"("start_year");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_majortrack_end_year_department_id_key" ON "graduation_majortrack"("end_year", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_majortrack_start_year_department_id_key" ON "graduation_majortrack"("start_year", "department_id");

-- CreateIndex
CREATE INDEX "planner_arbitraryplanneritem_department_id_idx" ON "planner_arbitraryplanneritem"("department_id");

-- CreateIndex
CREATE INDEX "planner_arbitraryplanneritem_planner_id_idx" ON "planner_arbitraryplanneritem"("planner_id");

-- CreateIndex
CREATE INDEX "planner_arbitraryplanneritem_semester_idx" ON "planner_arbitraryplanneritem"("semester");

-- CreateIndex
CREATE INDEX "planner_arbitraryplanneritem_year_idx" ON "planner_arbitraryplanneritem"("year");

-- CreateIndex
CREATE INDEX "planner_futureplanneritem_course_id_idx" ON "planner_futureplanneritem"("course_id");

-- CreateIndex
CREATE INDEX "planner_futureplanneritem_planner_id_idx" ON "planner_futureplanneritem"("planner_id");

-- CreateIndex
CREATE INDEX "planner_futureplanneritem_semester_idx" ON "planner_futureplanneritem"("semester");

-- CreateIndex
CREATE INDEX "planner_futureplanneritem_year_idx" ON "planner_futureplanneritem"("year");

-- CreateIndex
CREATE INDEX "planner_planner_arrange_order_idx" ON "planner_planner"("arrange_order");

-- CreateIndex
CREATE INDEX "planner_planner_end_year_idx" ON "planner_planner"("end_year");

-- CreateIndex
CREATE INDEX "planner_planner_general_track_id_idx" ON "planner_planner"("general_track_id");

-- CreateIndex
CREATE INDEX "planner_planner_major_track_id_idx" ON "planner_planner"("major_track_id");

-- CreateIndex
CREATE INDEX "planner_planner_start_year_idx" ON "planner_planner"("start_year");

-- CreateIndex
CREATE INDEX "planner_planner_user_id_idx" ON "planner_planner"("user_id");

-- CreateIndex
CREATE INDEX "planner_planner_additional_tracks_additionaltrack_id_idx" ON "planner_planner_additional_tracks"("additionaltrack_id");

-- CreateIndex
CREATE UNIQUE INDEX "planner_planner_additional_tracks_planner_id_additionaltrac_key" ON "planner_planner_additional_tracks"("planner_id", "additionaltrack_id");

-- CreateIndex
CREATE INDEX "planner_takenplanneritem_lecture_id_idx" ON "planner_takenplanneritem"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "planner_takenplanneritem_planner_id_lecture_id_key" ON "planner_takenplanneritem"("planner_id", "lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_professor_course_list_professor_id_course_id_key" ON "subject_professor_course_list"("professor_id", "course_id");

-- CreateIndex
CREATE INDEX "sync_taken_lectures_year_semester_idx" ON "sync_taken_lectures"("year", "semester");

-- CreateIndex
CREATE INDEX "sync_taken_lectures_lecture_id_idx" ON "sync_taken_lectures"("lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_taken_lectures_student_id_lecture_id_key" ON "sync_taken_lectures"("student_id", "lecture_id");

-- CreateIndex
CREATE INDEX "paper_prof_to_subject_prof_paper_professor_id_idx" ON "paper_prof_to_subject_prof"("paper_professor_id");

-- CreateIndex
CREATE INDEX "paper_prof_to_subject_prof_subject_professor_id_idx" ON "paper_prof_to_subject_prof"("subject_professor_id");

-- CreateIndex
CREATE INDEX "paper_professor_department_paper_professor_id_idx" ON "paper_professor_department"("paper_professor_id");

-- CreateIndex
CREATE INDEX "paper_professor_department_subject_department_id_idx" ON "paper_professor_department"("subject_department_id");

-- CreateIndex
CREATE INDEX "paper_professor_id_idx" ON "paper"("professor_id");

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_famoushumanityreviewdailyfeed_reviews" ADD CONSTRAINT "main_famoushumanityreviewdailyfeed_reviews_famoushumanityr_fkey" FOREIGN KEY ("famoushumanityreviewdailyfeed_id") REFERENCES "main_famoushumanityreviewdailyfeed"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_famoushumanityreviewdailyfeed_reviews" ADD CONSTRAINT "main_famoushumanityreviewdailyfeed_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review_review"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_famousmajorreviewdailyfeed" ADD CONSTRAINT "main_famousmajorreviewdailyfeed_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_famousmajorreviewdailyfeed_reviews" ADD CONSTRAINT "main_famousmajorreviewdailyfeed_reviews_famousmajorreviewd_fkey" FOREIGN KEY ("famousmajorreviewdailyfeed_id") REFERENCES "main_famousmajorreviewdailyfeed"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_famousmajorreviewdailyfeed_reviews" ADD CONSTRAINT "main_famousmajorreviewdailyfeed_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review_review"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_rankedreviewdailyfeed" ADD CONSTRAINT "main_rankedreviewdailyfeed_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "subject_semester"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_ratedailyuserfeed" ADD CONSTRAINT "main_ratedailyuserfeed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_relatedcoursedailyuserfeed" ADD CONSTRAINT "main_relatedcoursedailyuserfeed_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_relatedcoursedailyuserfeed" ADD CONSTRAINT "main_relatedcoursedailyuserfeed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_reviewwritedailyuserfeed" ADD CONSTRAINT "main_reviewwritedailyuserfeed_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "main_reviewwritedailyuserfeed" ADD CONSTRAINT "main_reviewwritedailyuserfeed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "review_humanitybestreview" ADD CONSTRAINT "review_humanitybestreview_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review_review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_majorbestreview" ADD CONSTRAINT "review_majorbestreview_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review_review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_review" ADD CONSTRAINT "review_review_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_review" ADD CONSTRAINT "review_review_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_review" ADD CONSTRAINT "review_review_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "session_userprofile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reviewvote" ADD CONSTRAINT "review_reviewvote_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review_review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reviewvote" ADD CONSTRAINT "review_reviewvote_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_userprofile" ADD CONSTRAINT "session_userprofile_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_device" ADD CONSTRAINT "session_userprofile_device_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_agreement" ADD CONSTRAINT "session_userprofile_agreement_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreement"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_agreement" ADD CONSTRAINT "session_userprofile_agreement_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_notification" ADD CONSTRAINT "session_userprofile_notification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_notification" ADD CONSTRAINT "session_userprofile_notification_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_notification_history" ADD CONSTRAINT "session_userprofile_notification_history_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_notification_history" ADD CONSTRAINT "session_userprofile_notification_history_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_favorite_departments" ADD CONSTRAINT "session_userprofile_favorite_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_favorite_departments" ADD CONSTRAINT "session_userprofile_favorite_departments_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_majors" ADD CONSTRAINT "session_userprofile_majors_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_majors" ADD CONSTRAINT "session_userprofile_majors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_minors" ADD CONSTRAINT "session_userprofile_minors_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_minors" ADD CONSTRAINT "session_userprofile_minors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_specialized_major" ADD CONSTRAINT "session_userprofile_specialized_major_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_specialized_major" ADD CONSTRAINT "session_userprofile_specialized_major_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_taken_lectures" ADD CONSTRAINT "session_userprofile_taken_lectures_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session_userprofile_taken_lectures" ADD CONSTRAINT "session_userprofile_taken_lectures_userprofile_id_fkey" FOREIGN KEY ("userprofile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_classtime" ADD CONSTRAINT "subject_classtime_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course" ADD CONSTRAINT "subject_course_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_professors" ADD CONSTRAINT "subject_course_professors_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_professors" ADD CONSTRAINT "subject_course_professors_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "subject_professor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_related_courses_posterior" ADD CONSTRAINT "subject_course_related_courses_posterior_from_course_id_fkey" FOREIGN KEY ("from_course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_related_courses_posterior" ADD CONSTRAINT "subject_course_related_courses_posterior_to_course_id_fkey" FOREIGN KEY ("to_course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_related_courses_prior" ADD CONSTRAINT "subject_course_related_courses_prior_from_course_id_fkey" FOREIGN KEY ("from_course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_course_related_courses_prior" ADD CONSTRAINT "subject_course_related_courses_prior_to_course_id_fkey" FOREIGN KEY ("to_course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_courseuser" ADD CONSTRAINT "subject_courseuser_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_courseuser" ADD CONSTRAINT "subject_courseuser_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_examtime" ADD CONSTRAINT "subject_examtime_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_lecture" ADD CONSTRAINT "subject_lecture_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_lecture" ADD CONSTRAINT "subject_lecture_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_lecture_professors" ADD CONSTRAINT "subject_lecture_professors_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subject_lecture_professors" ADD CONSTRAINT "subject_lecture_professors_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "subject_professor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "support_rate" ADD CONSTRAINT "support_rate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_oldtimetable_lectures" ADD CONSTRAINT "timetable_oldtimetable_lectures_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_oldtimetable_lectures" ADD CONSTRAINT "timetable_oldtimetable_lectures_oldtimetable_id_fkey" FOREIGN KEY ("oldtimetable_id") REFERENCES "timetable_oldtimetable"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_timetable" ADD CONSTRAINT "timetable_timetable_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_timetable_lectures" ADD CONSTRAINT "timetable_timetable_lectures_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_timetable_lectures" ADD CONSTRAINT "timetable_timetable_lectures_timetable_id_fkey" FOREIGN KEY ("timetable_id") REFERENCES "timetable_timetable"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_timetable_customblocks" ADD CONSTRAINT "timetable_timetable_customblocks_custom_block_id_fkey" FOREIGN KEY ("custom_block_id") REFERENCES "block_custom_blocks"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_timetable_customblocks" ADD CONSTRAINT "timetable_timetable_customblocks_timetable_id_fkey" FOREIGN KEY ("timetable_id") REFERENCES "timetable_timetable"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_wishlist" ADD CONSTRAINT "timetable_wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_wishlist_lectures" ADD CONSTRAINT "timetable_wishlist_lectures_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "timetable_wishlist_lectures" ADD CONSTRAINT "timetable_wishlist_lectures_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "timetable_wishlist"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "graduation_additionaltrack" ADD CONSTRAINT "graduation_additionaltrack_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "graduation_majortrack" ADD CONSTRAINT "graduation_majortrack_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "planner_arbitraryplanneritem" ADD CONSTRAINT "planner_arbitraryplanneritem_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "subject_department"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_arbitraryplanneritem" ADD CONSTRAINT "planner_arbitraryplanneritem_planner_id_fkey" FOREIGN KEY ("planner_id") REFERENCES "planner_planner"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_futureplanneritem" ADD CONSTRAINT "planner_futureplanneritem_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "subject_course"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_futureplanneritem" ADD CONSTRAINT "planner_futureplanneritem_planner_id_fkey" FOREIGN KEY ("planner_id") REFERENCES "planner_planner"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_planner" ADD CONSTRAINT "planner_planner_general_track_id_fkey" FOREIGN KEY ("general_track_id") REFERENCES "graduation_generaltrack"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "planner_planner" ADD CONSTRAINT "planner_planner_major_track_id_fkey" FOREIGN KEY ("major_track_id") REFERENCES "graduation_majortrack"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "planner_planner" ADD CONSTRAINT "planner_planner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "session_userprofile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "planner_planner_additional_tracks" ADD CONSTRAINT "planner_planner_additional_tracks_additionaltrack_id_fkey" FOREIGN KEY ("additionaltrack_id") REFERENCES "graduation_additionaltrack"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_planner_additional_tracks" ADD CONSTRAINT "planner_planner_additional_tracks_planner_id_fkey" FOREIGN KEY ("planner_id") REFERENCES "planner_planner"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_takenplanneritem" ADD CONSTRAINT "planner_takenplanneritem_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planner_takenplanneritem" ADD CONSTRAINT "planner_takenplanneritem_planner_id_fkey" FOREIGN KEY ("planner_id") REFERENCES "planner_planner"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sync_taken_lectures" ADD CONSTRAINT "sync_taken_lectures_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "subject_lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_prof_to_subject_prof" ADD CONSTRAINT "paper_prof_to_subject_prof_paper_professor_id_fkey" FOREIGN KEY ("paper_professor_id") REFERENCES "paper_professor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "paper_prof_to_subject_prof" ADD CONSTRAINT "paper_prof_to_subject_prof_subject_professor_id_fkey" FOREIGN KEY ("subject_professor_id") REFERENCES "subject_professor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "paper_professor_department" ADD CONSTRAINT "paper_professor_department_paper_professor_id_fkey" FOREIGN KEY ("paper_professor_id") REFERENCES "paper_professor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "paper_professor_department" ADD CONSTRAINT "paper_professor_department_subject_department_id_fkey" FOREIGN KEY ("subject_department_id") REFERENCES "subject_department"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "paper" ADD CONSTRAINT "paper_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "paper_professor"("id") ON DELETE SET NULL ON UPDATE RESTRICT;
