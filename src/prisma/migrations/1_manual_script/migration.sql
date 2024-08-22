-- check subject_professor_course_list table for drop 
select distinct subject_professor_course_list.course_id from subject_professor_course_list where not exists(
    select subject_course.id from subject_course
            where subject_course.id = subject_professor_course_list.course_id
    );

select * from subject_course where subject_course.id in (21328, 21323);


select count(*)
from subject_professor_course_list left join subject_professor on subject_professor.id = subject_professor_course_list.professor_id
where subject_professor_course_list.course_id in (21328, 21323);

select * from subject_lecture where subject_lecture.course_id in (21328, 21323);

select * from review_review where review_review.course_id in (21328, 21323);


select count(*)
from subject_professor_course_list left join subject_course_professors on (
    subject_professor_course_list.course_id = subject_course_professors.course_id and
    subject_professor_course_list.professor_id = subject_course_professors.professor_id
    )
where subject_professor_course_list.course_id not in (21328, 21323);

select count(*) from subject_professor_course_list;
select count(*) from subject_course_professors;

DELETE FROM subject_professor_course_list WHERE course_id = 21328;
DELETE FROM subject_professor_course_list WHERE course_id = 21323;