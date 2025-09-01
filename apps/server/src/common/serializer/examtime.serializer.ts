import { subject_examtime } from '@prisma/client'

import { getTimeNumeric } from '@otl/common'
import { DAY_STR, DAY_STR_EN } from '@otl/common/enum/time'

const timeFormatter = (time: Date) => `${time.getUTCHours().toString().padStart(2, '0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`

export const toJsonExamtime = (examtime: subject_examtime) => ({
  day: examtime.day,
  str: `${DAY_STR[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
  str_en: `${DAY_STR_EN[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
  begin: getTimeNumeric(examtime.begin, false),
  end: getTimeNumeric(examtime.end, false),
})

export const v2toJsonExamtime = (examtime: subject_examtime) => ({
  day: examtime.day,
  str: `${DAY_STR[examtime.day]} ${timeFormatter(examtime.begin)} ~ ${timeFormatter(examtime.end)}`,
  begin: getTimeNumeric(examtime.begin, false),
  end: getTimeNumeric(examtime.end, false),
})
