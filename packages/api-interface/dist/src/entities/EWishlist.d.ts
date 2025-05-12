import { Prisma } from '@prisma/client';
export declare namespace EWishlist {
  const WithLectures: {
    include: {
      timetable_wishlist_lectures: {
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
        where: {
          subject_lecture: {
            deleted: false;
          };
        };
      };
    };
  };
  type WithLectures = Prisma.timetable_wishlistGetPayload<typeof WithLectures>;
}
