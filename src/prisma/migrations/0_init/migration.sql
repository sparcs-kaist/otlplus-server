-- CreateTable
create table _prisma_migrations (
    id varchar(36) not null primary key, 
    checksum varchar(64) not null, 
    finished_at datetime(3) null, 
    migration_name varchar(255) not null, 
    logs text null, rolled_back_at datetime(3) null, 
    started_at datetime(3) default CURRENT_TIMESTAMP(3) not null, 
    applied_steps_count int unsigned default 0 not null
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable
CREATE TABLE `auth_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `name`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_group_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    INDEX `auth_group__permission_id_1f49ccbbdc69d2fc_fk_auth_permission_id`(`permission_id` ASC),
    UNIQUE INDEX `group_id`(`group_id` ASC, `permission_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `content_type_id` INTEGER NOT NULL,
    `codename` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `content_type_id`(`content_type_id` ASC, `codename` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(128) NOT NULL,
    `last_login` DATETIME(0) NULL,
    `is_superuser` BOOLEAN NOT NULL,
    `username` VARCHAR(150) NOT NULL,
    `first_name` VARCHAR(30) NOT NULL,
    `last_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `is_staff` BOOLEAN NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `date_joined` DATETIME(0) NOT NULL,

    UNIQUE INDEX `username`(`username` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_user_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,

    INDEX `auth_user_groups_group_id_33ac548dcf5f8e37_fk_auth_group_id`(`group_id` ASC),
    UNIQUE INDEX `user_id`(`user_id` ASC, `group_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_user_user_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    INDEX `auth_user_u_permission_id_384b62483d7071f0_fk_auth_permission_id`(`permission_id` ASC),
    UNIQUE INDEX `user_id`(`user_id` ASC, `permission_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `django_admin_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action_time` DATETIME(0) NOT NULL,
    `object_id` LONGTEXT NULL,
    `object_repr` VARCHAR(200) NOT NULL,
    `action_flag` SMALLINT UNSIGNED NOT NULL,
    `change_message` LONGTEXT NOT NULL,
    `content_type_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `djang_content_type_id_697914295151027a_fk_django_content_type_id`(`content_type_id` ASC),
    INDEX `django_admin_log_user_id_52fdd58701c5f563_fk_auth_user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `django_content_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `app_label` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `django_content_type_app_label_45f3b1d93ec8c61c_uniq`(`app_label` ASC, `model` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `django_migrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `app` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `applied` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `django_session` (
    `session_key` VARCHAR(40) NOT NULL,
    `session_data` LONGTEXT NOT NULL,
    `expire_date` DATETIME(0) NOT NULL,

    INDEX `django_session_de54fa62`(`expire_date` ASC),
    PRIMARY KEY (`session_key` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `graduation_additionaltrack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_year` INTEGER NOT NULL,
    `end_year` INTEGER NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `major_required` INTEGER NOT NULL,
    `major_elective` INTEGER NOT NULL,
    `department_id` INTEGER NULL,

    INDEX `graduation_additiona_department_id_788c5289_fk_subject_d`(`department_id` ASC),
    UNIQUE INDEX `graduation_additionaltra_end_year_type_department_9d873c1b_uniq`(`end_year` ASC, `type` ASC, `department_id` ASC),
    UNIQUE INDEX `graduation_additionaltra_start_year_type_departme_763552eb_uniq`(`start_year` ASC, `type` ASC, `department_id` ASC),
    INDEX `graduation_additionaltrack_end_year_6af1030b`(`end_year` ASC),
    INDEX `graduation_additionaltrack_start_year_7a87318d`(`start_year` ASC),
    INDEX `graduation_additionaltrack_type_0fa38fc5`(`type` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `graduation_generaltrack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_year` INTEGER NOT NULL,
    `end_year` INTEGER NOT NULL,
    `is_foreign` BOOLEAN NOT NULL,
    `total_credit` INTEGER NOT NULL,
    `total_au` INTEGER NOT NULL,
    `basic_required` INTEGER NOT NULL,
    `basic_elective` INTEGER NOT NULL,
    `thesis_study` INTEGER NOT NULL,
    `thesis_study_doublemajor` INTEGER NOT NULL,
    `general_required_credit` INTEGER NOT NULL,
    `general_required_au` INTEGER NOT NULL,
    `humanities` INTEGER NOT NULL,
    `humanities_doublemajor` INTEGER NOT NULL,

    INDEX `graduation_generaltrack_end_year_3bba699e`(`end_year` ASC),
    UNIQUE INDEX `graduation_generaltrack_end_year_is_foreign_1f062f8b_uniq`(`end_year` ASC, `is_foreign` ASC),
    INDEX `graduation_generaltrack_is_foreign_d38919a2`(`is_foreign` ASC),
    INDEX `graduation_generaltrack_start_year_00aee782`(`start_year` ASC),
    UNIQUE INDEX `graduation_generaltrack_start_year_is_foreign_c1eb425f_uniq`(`start_year` ASC, `is_foreign` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `graduation_majortrack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_year` INTEGER NOT NULL,
    `end_year` INTEGER NOT NULL,
    `basic_elective_doublemajor` INTEGER NOT NULL,
    `major_required` INTEGER NOT NULL,
    `major_elective` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `graduation_majortrac_department_id_81bfc8fa_fk_subject_d`(`department_id` ASC),
    INDEX `graduation_majortrack_end_year_57017559`(`end_year` ASC),
    UNIQUE INDEX `graduation_majortrack_end_year_department_id_b3ef1bc8_uniq`(`end_year` ASC, `department_id` ASC),
    INDEX `graduation_majortrack_start_year_6281dc28`(`start_year` ASC),
    UNIQUE INDEX `graduation_majortrack_start_year_department_id_59122c6d_uniq`(`start_year` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_famoushumanityreviewdailyfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `visible` BOOLEAN NOT NULL,

    UNIQUE INDEX `main_famoushumanityreviewdailyfeed_date_0fbb607a_uniq`(`date` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_famoushumanityreviewdailyfeed_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `famoushumanityreviewdailyfeed_id` INTEGER NOT NULL,
    `review_id` INTEGER NOT NULL,

    UNIQUE INDEX `main_famoushumani_famoushumanityreviewdailyfeed_id_97def4df_uniq`(`famoushumanityreviewdailyfeed_id` ASC, `review_id` ASC),
    INDEX `main_famoushumanityreview_review_id_f305d8aa_fk_review_review_id`(`review_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_famousmajorreviewdailyfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `department_id` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL,

    INDEX `main_famousmajorrevi_department_id_a0a5a3a5_fk_subject_d`(`department_id` ASC),
    UNIQUE INDEX `main_famousreviewdailyfeed_date_94cf00dd_uniq`(`date` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_famousmajorreviewdailyfeed_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `famousmajorreviewdailyfeed_id` INTEGER NOT NULL,
    `review_id` INTEGER NOT NULL,

    INDEX `main_famousmajorreviewdai_review_id_c0d3bbec_fk_review_review_id`(`review_id` ASC),
    UNIQUE INDEX `main_famousreviewdailyfee_famousreviewdailyfeed_id_12d71d0b_uniq`(`famousmajorreviewdailyfeed_id` ASC, `review_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_rankedreviewdailyfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `visible` BOOLEAN NOT NULL,
    `semester_id` INTEGER NULL,

    INDEX `main_rankedreviewdai_semester_id_f71e3a66_fk_subject_s`(`semester_id` ASC),
    UNIQUE INDEX `main_rankedreviewdailyfeed_date_635bca2a_uniq`(`date` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_ratedailyuserfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `visible` BOOLEAN NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `main_ratedailyuserfe_user_id_31a534d5_fk_session_u`(`user_id` ASC),
    UNIQUE INDEX `main_ratedailyuserfeed_date_user_id_4142794f_uniq`(`date` ASC, `user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_relatedcoursedailyuserfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `course_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL,

    INDEX `main_relatedcourseda_course_id_129fc5e2_fk_subject_c`(`course_id` ASC),
    INDEX `main_relatedcoursedai_user_id_a1be2390_fk_session_userprofile_id`(`user_id` ASC),
    UNIQUE INDEX `main_relatedcoursedailyuserfeed_date_6043d8bb_uniq`(`date` ASC, `user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_reviewwritedailyuserfeed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` DOUBLE NOT NULL,
    `lecture_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL,

    INDEX `main_reviewwritedail_lecture_id_75ed0f87_fk_subject_l`(`lecture_id` ASC),
    INDEX `main_reviewwritedaily_user_id_9ffd0881_fk_session_userprofile_id`(`user_id` ASC),
    UNIQUE INDEX `main_reviewwritedailyuserfeed_date_1e7bc6d7_uniq`(`date` ASC, `user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planner_arbitraryplanneritem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_excluded` BOOLEAN NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `type` VARCHAR(12) NOT NULL,
    `type_en` VARCHAR(36) NOT NULL,
    `credit` INTEGER NOT NULL,
    `credit_au` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `planner_id` INTEGER NOT NULL,

    INDEX `planner_arbitrarypla_department_id_0dc7ce25_fk_subject_d`(`department_id` ASC),
    INDEX `planner_arbitrarypla_planner_id_d6069d2c_fk_planner_p`(`planner_id` ASC),
    INDEX `planner_arbitraryplanneritem_semester_7508baa5`(`semester` ASC),
    INDEX `planner_arbitraryplanneritem_year_5a0c7252`(`year` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planner_futureplanneritem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_excluded` BOOLEAN NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,
    `planner_id` INTEGER NOT NULL,

    INDEX `planner_futureplanne_course_id_b1a06444_fk_subject_c`(`course_id` ASC),
    INDEX `planner_futureplanne_planner_id_dfd70193_fk_planner_p`(`planner_id` ASC),
    INDEX `planner_futureplanneritem_semester_cda6512e`(`semester` ASC),
    INDEX `planner_futureplanneritem_year_5e3a2d4e`(`year` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planner_planner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_year` INTEGER NOT NULL,
    `end_year` INTEGER NOT NULL,
    `arrange_order` SMALLINT NOT NULL,
    `general_track_id` INTEGER NOT NULL,
    `major_track_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `planner_planner_arrange_order_e50a3044`(`arrange_order` ASC),
    INDEX `planner_planner_end_year_e5fab7f3`(`end_year` ASC),
    INDEX `planner_planner_general_track_id_6d607973_fk_graduatio`(`general_track_id` ASC),
    INDEX `planner_planner_major_track_id_9f7204bd_fk_graduatio`(`major_track_id` ASC),
    INDEX `planner_planner_start_year_463173f3`(`start_year` ASC),
    INDEX `planner_planner_user_id_17740247_fk_session_userprofile_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planner_planner_additional_tracks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planner_id` INTEGER NOT NULL,
    `additionaltrack_id` INTEGER NOT NULL,

    INDEX `planner_planner_addi_additionaltrack_id_c46b8c4e_fk_graduatio`(`additionaltrack_id` ASC),
    UNIQUE INDEX `planner_planner_addition_planner_id_additionaltra_2298c5cd_uniq`(`planner_id` ASC, `additionaltrack_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planner_takenplanneritem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_excluded` BOOLEAN NOT NULL,
    `lecture_id` INTEGER NOT NULL,
    `planner_id` INTEGER NOT NULL,

    INDEX `planner_takenplanner_lecture_id_9b2d30d8_fk_subject_l`(`lecture_id` ASC),
    UNIQUE INDEX `planner_takenplanneritem_planner_id_lecture_id_4b39b432_uniq`(`planner_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_humanitybestreview` (
    `review_id` INTEGER NOT NULL,

    PRIMARY KEY (`review_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_majorbestreview` (
    `review_id` INTEGER NOT NULL,

    PRIMARY KEY (`review_id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `grade` SMALLINT NOT NULL,
    `load` SMALLINT NOT NULL,
    `speech` SMALLINT NOT NULL,
    `writer_id` INTEGER NULL,
    `writer_label` VARCHAR(200) NOT NULL,
    `updated_datetime` DATETIME(0) NOT NULL,
    `like` INTEGER NOT NULL,
    `is_deleted` INTEGER NOT NULL,
    `written_datetime` DATETIME(0) NULL,

    INDEX `review_comment_e5e30a4a`(`written_datetime` ASC),
    UNIQUE INDEX `review_comment_writer_id_af700a5d_uniq`(`writer_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_reviewvote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NOT NULL,
    `userprofile_id` INTEGER NULL,
    `created_datetime` DATETIME(6) NULL,

    UNIQUE INDEX `review_commentvote_comment_id_e4594aea_uniq`(`review_id` ASC, `userprofile_id` ASC),
    INDEX `review_reviewvote_created_datetime_450f85e2`(`created_datetime` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `student_id` VARCHAR(10) NOT NULL,
    `sid` VARCHAR(30) NOT NULL,
    `language` VARCHAR(15) NOT NULL,
    `portal_check` INTEGER NULL DEFAULT 0,
    `department_id` INTEGER NULL,
    `email` VARCHAR(255) NULL,

    UNIQUE INDEX `session_userprofile_user_id_09dd6af1_uniq`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_favorite_departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    UNIQUE INDEX `userprofile_id`(`userprofile_id` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_majors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `session_userprof_department_id_db568678_fk_subject_department_id`(`department_id` ASC),
    UNIQUE INDEX `session_userprofile_majors_userprofile_id_12b76c49_uniq`(`userprofile_id` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_minors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `session_userprof_department_id_7a7ea3ed_fk_subject_department_id`(`department_id` ASC),
    UNIQUE INDEX `session_userprofile_minors_userprofile_id_d01e3e38_uniq`(`userprofile_id` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_specialized_major` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `session_userprof_department_id_919e11be_fk_subject_department_id`(`department_id` ASC),
    UNIQUE INDEX `session_userprofile_specialized_maj_userprofile_id_3951a553_uniq`(`userprofile_id` ASC, `department_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_userprofile_taken_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userprofile_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    UNIQUE INDEX `userprofile_id`(`userprofile_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_classtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` SMALLINT NOT NULL,
    `begin` TIME(0) NOT NULL,
    `end` TIME(0) NOT NULL,
    `type` VARCHAR(1) NOT NULL,
    `building_id` VARCHAR(10) NULL,
    `building_full_name` VARCHAR(60) NULL,
    `building_full_name_en` VARCHAR(60) NULL,
    `room_name` VARCHAR(20) NULL,
    `unit_time` SMALLINT NULL,
    `lecture_id` INTEGER NULL,

    INDEX `subject_classtime_72a11f01`(`lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `old_code` VARCHAR(10) NOT NULL,
    `department_id` INTEGER NOT NULL,
    `type` VARCHAR(12) NOT NULL,
    `type_en` VARCHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `title_en` VARCHAR(200) NOT NULL,
    `summury` VARCHAR(400) NOT NULL,
    `grade_sum` DOUBLE NOT NULL,
    `load_sum` DOUBLE NOT NULL,
    `speech_sum` DOUBLE NOT NULL,
    `review_total_weight` DOUBLE NOT NULL,
    `grade` DOUBLE NOT NULL,
    `load` DOUBLE NOT NULL,
    `speech` DOUBLE NOT NULL,
    `latest_written_datetime` DATETIME(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course_professors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `professor_id` INTEGER NOT NULL,

    UNIQUE INDEX `course_id`(`course_id` ASC, `professor_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course_related_courses_posterior` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_course_id` INTEGER NOT NULL,
    `to_course_id` INTEGER NOT NULL,

    INDEX `subject_course_relat_to_course_id_5fbd4d28_fk_subject_c`(`to_course_id` ASC),
    UNIQUE INDEX `subject_course_related_c_from_course_id_to_course_eaec2f22_uniq`(`from_course_id` ASC, `to_course_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course_related_courses_prior` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_course_id` INTEGER NOT NULL,
    `to_course_id` INTEGER NOT NULL,

    INDEX `subject_course_relat_to_course_id_52f44705_fk_subject_c`(`to_course_id` ASC),
    UNIQUE INDEX `subject_course_related_c_from_course_id_to_course_74e1ae5f_uniq`(`from_course_id` ASC, `to_course_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_courseuser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `latest_read_datetime` DATETIME(0) NOT NULL,
    `course_id` INTEGER NOT NULL,
    `user_profile_id` INTEGER NOT NULL,

    UNIQUE INDEX `subject_courseuser_course_id_a26ac0b3_uniq`(`course_id` ASC, `user_profile_id` ASC),
    INDEX `subject_courseuser_user_profile_id_4d15ef1b_fk_session_u`(`user_profile_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_department` (
    `id` INTEGER NOT NULL,
    `num_id` VARCHAR(4) NOT NULL,
    `code` VARCHAR(5) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `name_en` VARCHAR(60) NULL,
    `visible` BOOLEAN NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_examtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` SMALLINT NOT NULL,
    `begin` TIME(0) NOT NULL,
    `end` TIME(0) NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    INDEX `subject_examtime_72a11f01`(`lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_lecture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `old_code` VARCHAR(10) NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` SMALLINT NOT NULL,
    `department_id` INTEGER NOT NULL,
    `class_no` VARCHAR(4) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `title_en` VARCHAR(200) NOT NULL,
    `type` VARCHAR(12) NOT NULL,
    `type_en` VARCHAR(36) NOT NULL,
    `audience` INTEGER NOT NULL,
    `credit` INTEGER NOT NULL,
    `num_classes` INTEGER NOT NULL,
    `num_labs` INTEGER NOT NULL,
    `credit_au` INTEGER NOT NULL,
    `limit` INTEGER NOT NULL,
    `num_people` INTEGER NULL,
    `is_english` BOOLEAN NOT NULL,
    `deleted` BOOLEAN NOT NULL,
    `course_id` INTEGER NOT NULL,
    `grade_sum` DOUBLE NOT NULL,
    `load_sum` DOUBLE NOT NULL,
    `speech_sum` DOUBLE NOT NULL,
    `grade` DOUBLE NOT NULL,
    `load` DOUBLE NOT NULL,
    `speech` DOUBLE NOT NULL,
    `review_total_weight` DOUBLE NOT NULL,
    `class_title` VARCHAR(100) NULL,
    `class_title_en` VARCHAR(100) NULL,
    `common_title` VARCHAR(100) NULL,
    `common_title_en` VARCHAR(100) NULL,

    INDEX `subject_lecture_deleted_bedc6156_uniq`(`deleted` ASC),
    INDEX `subject_lecture_type_en_45ee2d3a_uniq`(`type_en` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_lecture_professors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecture_id` INTEGER NOT NULL,
    `professor_id` INTEGER NOT NULL,

    UNIQUE INDEX `lecture_id`(`lecture_id` ASC, `professor_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_professor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_name` VARCHAR(100) NOT NULL,
    `professor_name_en` VARCHAR(100) NULL,
    `professor_id` INTEGER NOT NULL,
    `major` VARCHAR(30) NOT NULL,
    `grade_sum` DOUBLE NOT NULL,
    `load_sum` DOUBLE NOT NULL,
    `speech_sum` DOUBLE NOT NULL,
    `review_total_weight` DOUBLE NOT NULL,
    `grade` DOUBLE NOT NULL,
    `load` DOUBLE NOT NULL,
    `speech` DOUBLE NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_professor_course_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professor_id` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,

    UNIQUE INDEX `professor_id`(`professor_id` ASC, `course_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_semester` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `beginning` DATETIME(0) NOT NULL,
    `end` DATETIME(0) NOT NULL,
    `courseRegistrationPeriodStart` DATETIME(0) NULL,
    `courseRegistrationPeriodEnd` DATETIME(0) NULL,
    `courseAddDropPeriodEnd` DATETIME(0) NULL,
    `courseDropDeadline` DATETIME(0) NULL,
    `courseEvaluationDeadline` DATETIME(0) NULL,
    `gradePosting` DATETIME(0) NULL,
    `courseDesciptionSubmission` DATETIME(0) NULL,

    INDEX `subject_semester_1b3810e0`(`semester` ASC),
    INDEX `subject_semester_84cdc76c`(`year` ASC),
    UNIQUE INDEX `subject_semester_year_680c861f_uniq`(`year` ASC, `semester` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_notice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` LONGTEXT NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score` SMALLINT NOT NULL,
    `year` SMALLINT NOT NULL,
    `created_datetime` DATETIME(0) NULL,
    `user_id` INTEGER NOT NULL,
    `version` VARCHAR(20) NOT NULL,

    INDEX `support_rate_created_datetime_d38a29eb`(`created_datetime` ASC),
    UNIQUE INDEX `support_rate_user_id_year_a62fc7f7_uniq`(`user_id` ASC, `year` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_oldtimetable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` VARCHAR(10) NOT NULL,
    `year` INTEGER NULL,
    `semester` SMALLINT NULL,
    `table_no` SMALLINT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_oldtimetable_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `oldtimetable_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    INDEX `timetable_oldtimetable_lecture_id_b19d5300_fk_subject_lecture_id`(`lecture_id` ASC),
    UNIQUE INDEX `timetable_oldtimetable_lecture_oldtimetable_id_27bf3d09_uniq`(`oldtimetable_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_timetable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NULL,
    `semester` SMALLINT NULL,
    `user_id` INTEGER NOT NULL,
    `arrange_order` SMALLINT NOT NULL,

    INDEX `timetable_timetable_arrange_order_84c8935c`(`arrange_order` ASC),
    INDEX `timetable_timetable_semester_d8ce5d37_uniq`(`semester` ASC),
    INDEX `timetable_timetable_user_id_0d214170_fk_session_userprofile_id`(`user_id` ASC),
    INDEX `timetable_timetable_year_907cf59a_uniq`(`year` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_timetable_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timetable_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    INDEX `timetable_timetable_le_lecture_id_79aa5f2e_fk_subject_lecture_id`(`lecture_id` ASC),
    UNIQUE INDEX `timetable_timetable_lecture_timetable_id_57195f56_uniq`(`timetable_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_wishlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_wishlist_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wishlist_id` INTEGER NOT NULL,
    `lecture_id` INTEGER NOT NULL,

    INDEX `timetable_wishlist_lec_lecture_id_1ab5d523_fk_subject_lecture_id`(`lecture_id` ASC),
    UNIQUE INDEX `timetable_wishlist_lectures_wishlist_id_e4c47efe_uniq`(`wishlist_id` ASC, `lecture_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auth_group_permissions` ADD CONSTRAINT `auth_group__permission_id_1f49ccbbdc69d2fc_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_group_permissions` ADD CONSTRAINT `auth_group_permission_group_id_689710a9a73b7457_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_permission` ADD CONSTRAINT `auth__content_type_id_508cf46651277a81_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_user_groups` ADD CONSTRAINT `auth_user_groups_group_id_33ac548dcf5f8e37_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_user_groups` ADD CONSTRAINT `auth_user_groups_user_id_4b5ed4ffdb8fd9b0_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_user_user_permissions` ADD CONSTRAINT `auth_user_u_permission_id_384b62483d7071f0_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auth_user_user_permissions` ADD CONSTRAINT `auth_user_user_permissi_user_id_7f0938558328534a_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `django_admin_log` ADD CONSTRAINT `djang_content_type_id_697914295151027a_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `django_admin_log` ADD CONSTRAINT `django_admin_log_user_id_52fdd58701c5f563_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `graduation_additionaltrack` ADD CONSTRAINT `graduation_additiona_department_id_788c5289_fk_subject_d` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `graduation_majortrack` ADD CONSTRAINT `graduation_majortrac_department_id_81bfc8fa_fk_subject_d` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_famoushumanityreviewdailyfeed_reviews` ADD CONSTRAINT `e567529fdfd543a96610b342fea2bb84` FOREIGN KEY (`famoushumanityreviewdailyfeed_id`) REFERENCES `main_famoushumanityreviewdailyfeed`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_famoushumanityreviewdailyfeed_reviews` ADD CONSTRAINT `main_famoushumanityreview_review_id_f305d8aa_fk_review_review_id` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_famousmajorreviewdailyfeed` ADD CONSTRAINT `main_famousmajorrevi_department_id_a0a5a3a5_fk_subject_d` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_famousmajorreviewdailyfeed_reviews` ADD CONSTRAINT `D122ed8a8adef1dafa8cd66f142ebb40` FOREIGN KEY (`famousmajorreviewdailyfeed_id`) REFERENCES `main_famousmajorreviewdailyfeed`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_famousmajorreviewdailyfeed_reviews` ADD CONSTRAINT `main_famousmajorreviewdai_review_id_c0d3bbec_fk_review_review_id` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_rankedreviewdailyfeed` ADD CONSTRAINT `main_rankedreviewdai_semester_id_f71e3a66_fk_subject_s` FOREIGN KEY (`semester_id`) REFERENCES `subject_semester`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_ratedailyuserfeed` ADD CONSTRAINT `main_ratedailyuserfe_user_id_31a534d5_fk_session_u` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_relatedcoursedailyuserfeed` ADD CONSTRAINT `main_relatedcourseda_course_id_129fc5e2_fk_subject_c` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_relatedcoursedailyuserfeed` ADD CONSTRAINT `main_relatedcoursedai_user_id_a1be2390_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_reviewwritedailyuserfeed` ADD CONSTRAINT `main_reviewwritedail_lecture_id_75ed0f87_fk_subject_l` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `main_reviewwritedailyuserfeed` ADD CONSTRAINT `main_reviewwritedaily_user_id_9ffd0881_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_arbitraryplanneritem` ADD CONSTRAINT `planner_arbitrarypla_department_id_0dc7ce25_fk_subject_d` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_arbitraryplanneritem` ADD CONSTRAINT `planner_arbitrarypla_planner_id_d6069d2c_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_futureplanneritem` ADD CONSTRAINT `planner_futureplanne_course_id_b1a06444_fk_subject_c` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_futureplanneritem` ADD CONSTRAINT `planner_futureplanne_planner_id_dfd70193_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_planner` ADD CONSTRAINT `planner_planner_general_track_id_6d607973_fk_graduatio` FOREIGN KEY (`general_track_id`) REFERENCES `graduation_generaltrack`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_planner` ADD CONSTRAINT `planner_planner_major_track_id_9f7204bd_fk_graduatio` FOREIGN KEY (`major_track_id`) REFERENCES `graduation_majortrack`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_planner` ADD CONSTRAINT `planner_planner_user_id_17740247_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_planner_additional_tracks` ADD CONSTRAINT `planner_planner_addi_additionaltrack_id_c46b8c4e_fk_graduatio` FOREIGN KEY (`additionaltrack_id`) REFERENCES `graduation_additionaltrack`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_planner_additional_tracks` ADD CONSTRAINT `planner_planner_addi_planner_id_e439a309_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_takenplanneritem` ADD CONSTRAINT `planner_takenplanner_lecture_id_9b2d30d8_fk_subject_l` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `planner_takenplanneritem` ADD CONSTRAINT `planner_takenplanner_planner_id_b725ff83_fk_planner_p` FOREIGN KEY (`planner_id`) REFERENCES `planner_planner`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_majors` ADD CONSTRAINT `session_userpr_userprofile_id_20f3742a_fk_session_userprofile_id` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_majors` ADD CONSTRAINT `session_userprof_department_id_db568678_fk_subject_department_id` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_minors` ADD CONSTRAINT `session_userpr_userprofile_id_dad5ef83_fk_session_userprofile_id` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_minors` ADD CONSTRAINT `session_userprof_department_id_7a7ea3ed_fk_subject_department_id` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_specialized_major` ADD CONSTRAINT `session_userpr_userprofile_id_ca859cbe_fk_session_userprofile_id` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session_userprofile_specialized_major` ADD CONSTRAINT `session_userprof_department_id_919e11be_fk_subject_department_id` FOREIGN KEY (`department_id`) REFERENCES `subject_department`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_classtime` ADD CONSTRAINT `subject_classtime_lecture_id_bf773e65_fk_subject_lecture_id` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_related_courses_posterior` ADD CONSTRAINT `subject_course_relat_from_course_id_f520f461_fk_subject_c` FOREIGN KEY (`from_course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_related_courses_posterior` ADD CONSTRAINT `subject_course_relat_to_course_id_5fbd4d28_fk_subject_c` FOREIGN KEY (`to_course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_related_courses_prior` ADD CONSTRAINT `subject_course_relat_from_course_id_e994f30a_fk_subject_c` FOREIGN KEY (`from_course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course_related_courses_prior` ADD CONSTRAINT `subject_course_relat_to_course_id_52f44705_fk_subject_c` FOREIGN KEY (`to_course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_courseuser` ADD CONSTRAINT `subject_courseuser_course_id_2e4ccc6e_fk_subject_course_id` FOREIGN KEY (`course_id`) REFERENCES `subject_course`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_courseuser` ADD CONSTRAINT `subject_courseuser_user_profile_id_4d15ef1b_fk_session_u` FOREIGN KEY (`user_profile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_examtime` ADD CONSTRAINT `subject_examtime_lecture_id_a35fa20c_fk_subject_lecture_id` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `support_rate` ADD CONSTRAINT `support_rate_user_id_6d69ec9d_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_oldtimetable_lectures` ADD CONSTRAINT `timetable_oldtimetab_lecture_id_530c66bb_fk_subject_l` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_oldtimetable_lectures` ADD CONSTRAINT `timetable_oldtimetab_oldtimetable_id_88e61f89_fk_timetable` FOREIGN KEY (`oldtimetable_id`) REFERENCES `timetable_oldtimetable`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_timetable` ADD CONSTRAINT `timetable_timetable_user_id_0d214170_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_timetable_lectures` ADD CONSTRAINT `timetable_timetable__lecture_id_0aa33315_fk_subject_l` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_timetable_lectures` ADD CONSTRAINT `timetable_timetable__timetable_id_733ab103_fk_timetable` FOREIGN KEY (`timetable_id`) REFERENCES `timetable_timetable`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_wishlist` ADD CONSTRAINT `timetable_wishlist_user_id_d057a6e4_fk_session_userprofile_id` FOREIGN KEY (`user_id`) REFERENCES `session_userprofile`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_wishlist_lectures` ADD CONSTRAINT `timetable_wishlist_lec_lecture_id_1ab5d523_fk_subject_lecture_id` FOREIGN KEY (`lecture_id`) REFERENCES `subject_lecture`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `timetable_wishlist_lectures` ADD CONSTRAINT `timetable_wishlist_wishlist_id_efc7ae12_fk_timetable_wishlist_id` FOREIGN KEY (`wishlist_id`) REFERENCES `timetable_wishlist`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

