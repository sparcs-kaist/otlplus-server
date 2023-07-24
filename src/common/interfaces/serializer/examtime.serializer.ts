import { getTimeNumeric } from "src/common/utils/time.utils";
import { subject_examtime } from "src/prisma/generated/prisma-class/subject_examtime";

export const toJsonExamTime = (examtime: subject_examtime) => {
  const DAY_STR = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const DAY_STR_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return {
    "day": examtime.day,
    "str": `${DAY_STR[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
    "str_en": `${DAY_STR_EN[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
    "begin": getTimeNumeric(examtime.begin),
    "end": getTimeNumeric(examtime.begin),
  }
}

const timeFormatter = (time: Date) => {
  return `${time.getHours()}:${time.getMinutes()}`;
}