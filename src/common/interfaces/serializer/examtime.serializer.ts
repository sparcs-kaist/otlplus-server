import { getTimeNumeric } from "src/common/utils/time.utils";
import { subject_examtime } from "@prisma/client";

export const toJsonExamtime = (examtime: subject_examtime) => {
  const DAY_STR = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const DAY_STR_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return {
    "day": examtime.day,
    "str": `${DAY_STR[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
    "str_en": `${DAY_STR_EN[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
    "begin": getTimeNumeric(examtime.begin, false),
    "end": getTimeNumeric(examtime.end, false),
  }
}

const timeFormatter = (time: Date) => {
  return `${time.getUTCHours().toString().padStart(2,'0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`;
}