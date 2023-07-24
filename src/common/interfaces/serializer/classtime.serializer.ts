import { getTimeNumeric } from "src/common/utils/time.utils";
import { subject_classtime } from "src/prisma/generated/prisma-class/subject_classtime";

export const toJsonClassTime = (classtime: subject_classtime) => {
  const classroomInfo = getClassroomStrs(classtime);
  return Object.assign(classroomInfo, {
    "day": classtime.day,
    "begin": getTimeNumeric(classtime.begin),
    "end": getTimeNumeric(classtime.end),
  })
}

const getClassroomStrs = (classtime: subject_classtime) => {
  const buildingFullName = classtime.building_full_name;
  const buildingFullNameEn = classtime.building_full_name_en;

  if (!buildingFullName) {
    return {
      "building_code": "",
      "room_name": "",
      "classroom": "정보 없음",
      "classroom_en": "Unknown",
      "classroom_short": "정보 없음",
      "classroom_short_en": "Unknown",
    }
  } else if (buildingFullName[0] == "(") {
    const rightParanthesisIndex = buildingFullName.indexOf(")");
    const buildingCode = buildingFullName.slice(1, rightParanthesisIndex);
    const buildingName = buildingFullName.slice(rightParanthesisIndex+1);
    const buildingNameEn = buildingFullName.slice(rightParanthesisIndex+1);
    const roomName = classtime.room_name ?? "";
    const classroom = "(" + buildingCode + ") " + buildingName + " " + roomName;
    const classroomEn = "(" + buildingCode + ") " + buildingNameEn + " " + roomName;
    const classroomShort = "(" + buildingCode + ") " + roomName;
    const classroomShortEn = "(" + buildingCode + ") " + roomName;

    return {
      "building_code": buildingCode,
      "room_name": roomName,
      "classroom": classroom,
      "classroom_en": classroomEn,
      "classroom_short": classroomShort,
      "classroom_short_en": classroomShortEn,
    }
  } else {
    const buildingCode = "";
    const roomName = classtime.room_name ?? "";
    const classroom = buildingFullName + " " + roomName;
    const classroomEn = buildingFullNameEn + " " + roomName;
    const classroomShort = buildingFullName + " " + roomName;
    const classroomShortEn = buildingFullNameEn + " " + roomName;

    return {
      "building_code": buildingCode,
      "room_name": roomName,
      "classroom": classroom,
      "classroom_en": classroomEn,
      "classroom_short": classroomShort,
      "classroom_short_en": classroomShortEn,
    }
  }
}