import { ILecture } from '@otl/server-nest/common/interfaces'
import { subject_classtime } from '@prisma/client'

import { getTimeNumeric } from '@otl/common'

const getClassroomStrs = (classtime: subject_classtime) => {
  const buildingFullName = classtime.building_full_name
  const buildingFullNameEn = classtime.building_full_name_en

  if (!buildingFullName) {
    return {
      building_code: '',
      room_name: '',
      classroom: '정보 없음',
      classroom_en: 'Unknown',
      classroom_short: '정보 없음',
      classroom_short_en: 'Unknown',
    }
  }
  if (buildingFullName[0] === '(') {
    const rightParanthesisIndex = buildingFullName.indexOf(')')
    const buildingCode = buildingFullName.slice(1, rightParanthesisIndex)
    const buildingName = buildingFullName.slice(rightParanthesisIndex + 1)
    const buildingNameEn = buildingFullNameEn ? buildingFullNameEn.slice(rightParanthesisIndex + 1) : buildingName
    const roomName = classtime.room_name ?? ''
    const classroom = `(${buildingCode}) ${buildingName} ${roomName}`
    const classroomEn = `(${buildingCode}) ${buildingNameEn} ${roomName}`
    const classroomShort = `(${buildingCode}) ${roomName}`
    const classroomShortEn = `(${buildingCode}) ${roomName}`

    return {
      building_code: buildingCode,
      room_name: roomName,
      classroom,
      classroom_en: classroomEn,
      classroom_short: classroomShort,
      classroom_short_en: classroomShortEn,
    }
  }
  const buildingCode = ''
  const roomName = classtime.room_name ?? ''
  const classroom = `${buildingFullName} ${roomName}`
  const classroomEn = `${buildingFullNameEn} ${roomName}`
  const classroomShort = `${buildingFullName} ${roomName}`
  const classroomShortEn = `${buildingFullNameEn} ${roomName}`

  return {
    building_code: buildingCode,
    room_name: roomName,
    classroom,
    classroom_en: classroomEn,
    classroom_short: classroomShort,
    classroom_short_en: classroomShortEn,
  }
}

export const toJsonClasstime = (classtime: subject_classtime): ILecture.Classtime => {
  const classroomInfo = getClassroomStrs(classtime)
  return Object.assign(classroomInfo, {
    day: classtime.day,
    begin: getTimeNumeric(classtime.begin),
    end: getTimeNumeric(classtime.end),
  })
}

export const v2toJsonClasstime = (classtime: subject_classtime): ILecture.v2Classtime => {
  const classroomInfo = getClassroomStrs(classtime)
  return Object.assign(classroomInfo, {
    day: classtime.day,
    begin: getTimeNumeric(classtime.begin),
    end: getTimeNumeric(classtime.end),
    buildingCode: classroomInfo.building_code,
    placeName: classroomInfo.classroom,
    placeNameShort: classroomInfo.classroom_short,
  })
}
