-- A missing selection means enrolled timetable; stored selections always reference a saved timetable.
DELETE selection FROM timetable_home_selection AS selection
LEFT JOIN timetable_timetable AS timetable ON timetable.id = selection.timetable_id
WHERE timetable.id IS NULL OR timetable.user_id <> selection.user_id
  OR NOT (timetable.year <=> selection.year) OR NOT (timetable.semester <=> selection.semester);
DELETE selection FROM timetable_shared_selection AS selection
LEFT JOIN timetable_timetable AS timetable ON timetable.id = selection.timetable_id
WHERE timetable.id IS NULL OR timetable.user_id <> selection.user_id
  OR NOT (timetable.year <=> selection.year) OR NOT (timetable.semester <=> selection.semester);

-- Keep explicit main choices; otherwise use the first saved timetable in each semester.
INSERT INTO timetable_home_selection (user_id, year, semester, timetable_id)
SELECT timetable.user_id, timetable.year, timetable.semester, timetable.id
FROM timetable_timetable AS timetable
LEFT JOIN timetable_home_selection AS selection
  ON selection.user_id = timetable.user_id AND selection.year = timetable.year AND selection.semester = timetable.semester
LEFT JOIN timetable_timetable AS earlier
  ON earlier.user_id = timetable.user_id AND earlier.year = timetable.year AND earlier.semester = timetable.semester
  AND (earlier.arrange_order < timetable.arrange_order OR (earlier.arrange_order = timetable.arrange_order AND earlier.id < timetable.id))
WHERE timetable.year IS NOT NULL AND timetable.semester IS NOT NULL AND selection.id IS NULL AND earlier.id IS NULL;

ALTER TABLE timetable_home_selection
  DROP FOREIGN KEY timetable_home_selection_timetable_fk;
ALTER TABLE timetable_home_selection
  MODIFY timetable_id INTEGER NOT NULL,
  ADD CONSTRAINT timetable_home_selection_timetable_fk FOREIGN KEY (timetable_id)
    REFERENCES timetable_timetable (id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE timetable_shared_selection
  DROP FOREIGN KEY timetable_shared_selection_timetable_fk;
ALTER TABLE timetable_shared_selection
  MODIFY timetable_id INTEGER NOT NULL,
  ADD CONSTRAINT timetable_shared_selection_timetable_fk FOREIGN KEY (timetable_id)
    REFERENCES timetable_timetable (id) ON DELETE CASCADE ON UPDATE RESTRICT;
