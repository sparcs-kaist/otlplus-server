import { subject_lecture } from "../../prisma/generated/prisma-class/subject_lecture";
import { applyOrder } from "./search.utils";

export const getRepresentativeLecture = (lectures: subject_lecture[]): subject_lecture => {
  const orderedLectures = applyOrder<subject_lecture>(lectures, ["year", "semester"])
  return orderedLectures[0];
}