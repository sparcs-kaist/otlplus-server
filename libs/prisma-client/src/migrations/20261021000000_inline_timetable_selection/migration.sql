ALTER TABLE timetable_timetable
  ADD COLUMN is_main BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE timetable_timetable AS timetable
JOIN timetable_home_selection AS selection
  ON selection.timetable_id = timetable.id AND selection.user_id = timetable.user_id
  AND selection.year = timetable.year AND selection.semester = timetable.semester
SET timetable.is_main = TRUE;

UPDATE timetable_timetable AS timetable
JOIN timetable_shared_selection AS selection
  ON selection.timetable_id = timetable.id AND selection.user_id = timetable.user_id
  AND selection.year = timetable.year AND selection.semester = timetable.semester
SET timetable.is_shared = TRUE;

-- Preserve explicit choices; fill missing mains with the first saved timetable.
UPDATE timetable_timetable AS timetable
LEFT JOIN timetable_timetable AS main
  ON main.user_id = timetable.user_id AND main.year = timetable.year AND main.semester = timetable.semester AND main.is_main = TRUE
LEFT JOIN timetable_timetable AS earlier
  ON earlier.user_id = timetable.user_id AND earlier.year = timetable.year AND earlier.semester = timetable.semester
  AND (earlier.arrange_order < timetable.arrange_order OR (earlier.arrange_order = timetable.arrange_order AND earlier.id < timetable.id))
SET timetable.is_main = TRUE
WHERE timetable.year IS NOT NULL AND timetable.semester IS NOT NULL AND main.id IS NULL AND earlier.id IS NULL;

DROP TABLE timetable_home_selection;
DROP TABLE timetable_shared_selection;
