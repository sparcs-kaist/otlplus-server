import { auth_group as _auth_group } from './auth_group';
import { auth_group_permissions as _auth_group_permissions } from './auth_group_permissions';
import { auth_permission as _auth_permission } from './auth_permission';
import { auth_user as _auth_user } from './auth_user';
import { auth_user_groups as _auth_user_groups } from './auth_user_groups';
import { auth_user_user_permissions as _auth_user_user_permissions } from './auth_user_user_permissions';
import { django_admin_log as _django_admin_log } from './django_admin_log';
import { django_content_type as _django_content_type } from './django_content_type';
import { django_migrations as _django_migrations } from './django_migrations';
import { django_session as _django_session } from './django_session';
import { main_famoushumanityreviewdailyfeed as _main_famoushumanityreviewdailyfeed } from './main_famoushumanityreviewdailyfeed';
import { main_famoushumanityreviewdailyfeed_reviews as _main_famoushumanityreviewdailyfeed_reviews } from './main_famoushumanityreviewdailyfeed_reviews';
import { main_famousmajorreviewdailyfeed as _main_famousmajorreviewdailyfeed } from './main_famousmajorreviewdailyfeed';
import { main_famousmajorreviewdailyfeed_reviews as _main_famousmajorreviewdailyfeed_reviews } from './main_famousmajorreviewdailyfeed_reviews';
import { main_rankedreviewdailyfeed as _main_rankedreviewdailyfeed } from './main_rankedreviewdailyfeed';
import { main_ratedailyuserfeed as _main_ratedailyuserfeed } from './main_ratedailyuserfeed';
import { main_relatedcoursedailyuserfeed as _main_relatedcoursedailyuserfeed } from './main_relatedcoursedailyuserfeed';
import { main_reviewwritedailyuserfeed as _main_reviewwritedailyuserfeed } from './main_reviewwritedailyuserfeed';
import { review_humanitybestreview as _review_humanitybestreview } from './review_humanitybestreview';
import { review_majorbestreview as _review_majorbestreview } from './review_majorbestreview';
import { review_review as _review_review } from './review_review';
import { review_reviewvote as _review_reviewvote } from './review_reviewvote';
import { session_userprofile as _session_userprofile } from './session_userprofile';
import { session_userprofile_favorite_departments as _session_userprofile_favorite_departments } from './session_userprofile_favorite_departments';
import { session_userprofile_majors as _session_userprofile_majors } from './session_userprofile_majors';
import { session_userprofile_minors as _session_userprofile_minors } from './session_userprofile_minors';
import { session_userprofile_specialized_major as _session_userprofile_specialized_major } from './session_userprofile_specialized_major';
import { session_userprofile_taken_lectures as _session_userprofile_taken_lectures } from './session_userprofile_taken_lectures';
import { subject_classtime as _subject_classtime } from './subject_classtime';
import { subject_course as _subject_course } from './subject_course';
import { subject_course_professors as _subject_course_professors } from './subject_course_professors';
import { subject_course_related_courses_posterior as _subject_course_related_courses_posterior } from './subject_course_related_courses_posterior';
import { subject_course_related_courses_prior as _subject_course_related_courses_prior } from './subject_course_related_courses_prior';
import { subject_courseuser as _subject_courseuser } from './subject_courseuser';
import { subject_department as _subject_department } from './subject_department';
import { subject_examtime as _subject_examtime } from './subject_examtime';
import { subject_lecture as _subject_lecture } from './subject_lecture';
import { subject_lecture_professors as _subject_lecture_professors } from './subject_lecture_professors';
import { subject_professor as _subject_professor } from './subject_professor';
import { subject_semester as _subject_semester } from './subject_semester';
import { support_notice as _support_notice } from './support_notice';
import { support_rate as _support_rate } from './support_rate';
import { timetable_oldtimetable as _timetable_oldtimetable } from './timetable_oldtimetable';
import { timetable_oldtimetable_lectures as _timetable_oldtimetable_lectures } from './timetable_oldtimetable_lectures';
import { timetable_timetable as _timetable_timetable } from './timetable_timetable';
import { timetable_timetable_lectures as _timetable_timetable_lectures } from './timetable_timetable_lectures';
import { timetable_wishlist as _timetable_wishlist } from './timetable_wishlist';
import { timetable_wishlist_lectures as _timetable_wishlist_lectures } from './timetable_wishlist_lectures';
import { graduation_additionaltrack as _graduation_additionaltrack } from './graduation_additionaltrack';
import { graduation_generaltrack as _graduation_generaltrack } from './graduation_generaltrack';
import { graduation_majortrack as _graduation_majortrack } from './graduation_majortrack';
import { planner_arbitraryplanneritem as _planner_arbitraryplanneritem } from './planner_arbitraryplanneritem';
import { planner_futureplanneritem as _planner_futureplanneritem } from './planner_futureplanneritem';
import { planner_planner as _planner_planner } from './planner_planner';
import { planner_planner_additional_tracks as _planner_planner_additional_tracks } from './planner_planner_additional_tracks';
import { planner_takenplanneritem as _planner_takenplanneritem } from './planner_takenplanneritem';

export namespace PrismaModel {
  export class auth_group extends _auth_group {}
  export class auth_group_permissions extends _auth_group_permissions {}
  export class auth_permission extends _auth_permission {}
  export class auth_user extends _auth_user {}
  export class auth_user_groups extends _auth_user_groups {}
  export class auth_user_user_permissions extends _auth_user_user_permissions {}
  export class django_admin_log extends _django_admin_log {}
  export class django_content_type extends _django_content_type {}
  export class django_migrations extends _django_migrations {}
  export class django_session extends _django_session {}
  export class main_famoushumanityreviewdailyfeed extends _main_famoushumanityreviewdailyfeed {}
  export class main_famoushumanityreviewdailyfeed_reviews extends _main_famoushumanityreviewdailyfeed_reviews {}
  export class main_famousmajorreviewdailyfeed extends _main_famousmajorreviewdailyfeed {}
  export class main_famousmajorreviewdailyfeed_reviews extends _main_famousmajorreviewdailyfeed_reviews {}
  export class main_rankedreviewdailyfeed extends _main_rankedreviewdailyfeed {}
  export class main_ratedailyuserfeed extends _main_ratedailyuserfeed {}
  export class main_relatedcoursedailyuserfeed extends _main_relatedcoursedailyuserfeed {}
  export class main_reviewwritedailyuserfeed extends _main_reviewwritedailyuserfeed {}
  export class review_humanitybestreview extends _review_humanitybestreview {}
  export class review_majorbestreview extends _review_majorbestreview {}
  export class review_review extends _review_review {}
  export class review_reviewvote extends _review_reviewvote {}
  export class session_userprofile extends _session_userprofile {}
  export class session_userprofile_favorite_departments extends _session_userprofile_favorite_departments {}
  export class session_userprofile_majors extends _session_userprofile_majors {}
  export class session_userprofile_minors extends _session_userprofile_minors {}
  export class session_userprofile_specialized_major extends _session_userprofile_specialized_major {}
  export class session_userprofile_taken_lectures extends _session_userprofile_taken_lectures {}
  export class subject_classtime extends _subject_classtime {}
  export class subject_course extends _subject_course {}
  export class subject_course_professors extends _subject_course_professors {}
  export class subject_course_related_courses_posterior extends _subject_course_related_courses_posterior {}
  export class subject_course_related_courses_prior extends _subject_course_related_courses_prior {}
  export class subject_courseuser extends _subject_courseuser {}
  export class subject_department extends _subject_department {}
  export class subject_examtime extends _subject_examtime {}
  export class subject_lecture extends _subject_lecture {}
  export class subject_lecture_professors extends _subject_lecture_professors {}
  export class subject_professor extends _subject_professor {}
  export class subject_semester extends _subject_semester {}
  export class support_notice extends _support_notice {}
  export class support_rate extends _support_rate {}
  export class timetable_oldtimetable extends _timetable_oldtimetable {}
  export class timetable_oldtimetable_lectures extends _timetable_oldtimetable_lectures {}
  export class timetable_timetable extends _timetable_timetable {}
  export class timetable_timetable_lectures extends _timetable_timetable_lectures {}
  export class timetable_wishlist extends _timetable_wishlist {}
  export class timetable_wishlist_lectures extends _timetable_wishlist_lectures {}
  export class graduation_additionaltrack extends _graduation_additionaltrack {}
  export class graduation_generaltrack extends _graduation_generaltrack {}
  export class graduation_majortrack extends _graduation_majortrack {}
  export class planner_arbitraryplanneritem extends _planner_arbitraryplanneritem {}
  export class planner_futureplanneritem extends _planner_futureplanneritem {}
  export class planner_planner extends _planner_planner {}
  export class planner_planner_additional_tracks extends _planner_planner_additional_tracks {}
  export class planner_takenplanneritem extends _planner_takenplanneritem {}

  export const extraModels = [
    auth_group,
    auth_group_permissions,
    auth_permission,
    auth_user,
    auth_user_groups,
    auth_user_user_permissions,
    django_admin_log,
    django_content_type,
    django_migrations,
    django_session,
    main_famoushumanityreviewdailyfeed,
    main_famoushumanityreviewdailyfeed_reviews,
    main_famousmajorreviewdailyfeed,
    main_famousmajorreviewdailyfeed_reviews,
    main_rankedreviewdailyfeed,
    main_ratedailyuserfeed,
    main_relatedcoursedailyuserfeed,
    main_reviewwritedailyuserfeed,
    review_humanitybestreview,
    review_majorbestreview,
    review_review,
    review_reviewvote,
    session_userprofile,
    session_userprofile_favorite_departments,
    session_userprofile_majors,
    session_userprofile_minors,
    session_userprofile_specialized_major,
    session_userprofile_taken_lectures,
    subject_classtime,
    subject_course,
    subject_course_professors,
    subject_course_related_courses_posterior,
    subject_course_related_courses_prior,
    subject_courseuser,
    subject_department,
    subject_examtime,
    subject_lecture,
    subject_lecture_professors,
    subject_professor,
    subject_semester,
    support_notice,
    support_rate,
    timetable_oldtimetable,
    timetable_oldtimetable_lectures,
    timetable_timetable,
    timetable_timetable_lectures,
    timetable_wishlist,
    timetable_wishlist_lectures,
    graduation_additionaltrack,
    graduation_generaltrack,
    graduation_majortrack,
    planner_arbitraryplanneritem,
    planner_futureplanneritem,
    planner_planner,
    planner_planner_additional_tracks,
    planner_takenplanneritem,
  ];
}
