import { Prisma } from '@prisma/client';
export declare namespace EPlanners {
  namespace EItems {
    namespace Future {
      const Basic: {};
      type Basic = Prisma.planner_futureplanneritemGetPayload<typeof Basic>;
      const Extended: {
        include: {
          subject_course: {
            include: {
              lecture: true;
              subject_department: true;
              subject_course_professors: {
                include: {
                  professor: true;
                };
              };
            };
          };
        };
      };
      type Extended = Prisma.planner_futureplanneritemGetPayload<typeof Extended>;
      const Details: {
        include: {
          planner_planner: true;
          subject_course: {
            include: {
              lecture: true;
              subject_department: true;
              subject_course_professors: {
                include: {
                  professor: true;
                };
              };
            };
          };
        };
      };
      type Details = Prisma.planner_futureplanneritemGetPayload<typeof Details>;
    }
    namespace Taken {
      const Basic: {};
      type Basic = Prisma.planner_takenplanneritemGetPayload<typeof Basic>;
      const Extended: {
        include: {
          subject_lecture: {
            include: {
              subject_department: true;
              subject_lecture_professors: {
                include: {
                  professor: true;
                };
              };
              subject_classtime: true;
              subject_examtime: true;
            };
          };
        };
      };
      type Extended = Prisma.planner_takenplanneritemGetPayload<typeof Extended>;
      const Details: {
        include: {
          subject_lecture: {
            include: {
              course: {
                include: {
                  lecture: true;
                  subject_department: true;
                  subject_course_professors: {
                    include: {
                      professor: true;
                    };
                  };
                };
              };
              subject_department: true;
              subject_lecture_professors: {
                include: {
                  professor: true;
                };
              };
              subject_classtime: true;
              subject_examtime: true;
            };
          };
        };
      };
      type Details = Prisma.planner_takenplanneritemGetPayload<typeof Details>;
    }
    namespace Arbitrary {
      const CreateInput: {};
      type CreateInput = Prisma.planner_arbitraryplanneritemUncheckedCreateInput;
      const Basic: {};
      type Basic = Prisma.planner_arbitraryplanneritemGetPayload<typeof Basic>;
      const Extended: {
        include: {
          subject_department: true;
        };
      };
      type Extended = Prisma.planner_arbitraryplanneritemGetPayload<typeof Extended>;
      const Details: {
        include: {
          subject_department: true;
          planner_planner: true;
        };
      };
      type Details = Prisma.planner_arbitraryplanneritemGetPayload<typeof Details>;
    }
  }
  const Basic: {};
  type Basic = Prisma.planner_plannerGetPayload<typeof Basic>;
  const Details: {
    include: {
      planner_planner_additional_tracks: {
        include: {
          graduation_additionaltrack: {
            include: {
              subject_department: true;
            };
          };
        };
      };
      graduation_generaltrack: true;
      graduation_majortrack: {
        include: {
          subject_department: true;
        };
      };
      planner_takenplanneritem: {
        include: {
          subject_lecture: {
            include: {
              course: {
                include: {
                  lecture: true;
                  subject_department: true;
                  subject_course_professors: {
                    include: {
                      professor: true;
                    };
                  };
                };
              };
              subject_department: true;
              subject_lecture_professors: {
                include: {
                  professor: true;
                };
              };
              subject_classtime: true;
              subject_examtime: true;
            };
          };
        };
      };
      planner_arbitraryplanneritem: {
        include: {
          subject_department: true;
        };
      };
      planner_futureplanneritem: {
        include: {
          subject_course: {
            include: {
              lecture: true;
              subject_department: true;
              subject_course_professors: {
                include: {
                  professor: true;
                };
              };
            };
          };
        };
      };
    };
  };
  type Details = Prisma.planner_plannerGetPayload<typeof Details>;
}
