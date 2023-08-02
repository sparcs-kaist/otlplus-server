import { subject_lecture } from "@prisma/client";
import { applyOrder } from "./search.utils";

export const getRepresentativeLecture = (lectures: subject_lecture[]): subject_lecture => {
  const orderedLectures = applyOrder<subject_lecture>(lectures, ["year", "semester"])
  return orderedLectures[0];
}