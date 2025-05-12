import { Injectable, NotFoundException } from '@nestjs/common'

import { EFriend } from '../entities/EFriend'
import { PrismaService } from '../prisma.service'

@Injectable()
export class FriendsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFriends(userId: number): Promise<EFriend.Basic[]> {
    const friends = await this.prisma.friend_friend.findMany({
      where: { user_id: userId },
      include: EFriend.Basic.include,
    })
    return friends
  }

  // 겹강인 사람을 찾는 method
  async getFriendsWithLecture(userId: number, lectureId: number): Promise<EFriend.WithLecture[]> {
    return await this.prisma.friend_friend.findMany({
      where: { user_id: userId, friend: { taken_lectures: { some: { lecture_id: lectureId } } } },
      include: EFriend.WithLecture.include,
    })
  }

  // 이전에 그 교수님 수업을 들은 사람을 찾는 method
  // 과거 수강했던 사람만 조회
  async getFriendsWithLectureProfessor(
    userId: number,
    year: number,
    semester: number,
    courseId: number,
    professorIds: number[],
  ): Promise<EFriend.WithLectureProfessor[]> {
    return await this.prisma.friend_friend.findMany({
      where: {
        user_id: userId,
        friend: {
          taken_lectures: {
            some: {
              lecture: {
                subject_lecture_professors: { some: { professor_id: { in: professorIds } } },
                course_id: courseId,
                OR: [
                  {
                    year: {
                      lt: year,
                    },
                  },
                  {
                    year: {
                      equals: year,
                    },
                    semester: {
                      lt: semester,
                    },
                  },
                ],
              },
            },
          },
        },
      },
      include: EFriend.WithLectureProfessor.include,
    })
  }

  // 같은 강의 중 다른 교수님의 수업이었던 사람을 찾는 method
  // 과거 수강했던 사람만 조회
  async getFriendsWithCourse(
    userId: number,
    year: number,
    semester: number,
    courseId: number,
  ): Promise<EFriend.WithCourse[]> {
    return await this.prisma.friend_friend.findMany({
      where: {
        user_id: userId,
        friend: {
          taken_lectures: {
            some: {
              lecture: {
                course_id: courseId,
                OR: [
                  {
                    year: {
                      lt: year,
                    },
                  },
                  {
                    year: {
                      equals: year,
                    },
                    semester: {
                      lt: semester,
                    },
                  },
                ],
              },
            },
          },
        },
      },
      include: EFriend.WithCourse.include,
    })
  }

  async isFriend(userId: number, friendId: number): Promise<EFriend.Basic | null> {
    // gb: 이런 함수를 repository 안에 넣어놔도 되나요??
    const friend = await this.prisma.friend_friend.findFirst({
      where: { user_id: userId, friend_id: friendId },
      include: EFriend.Basic.include,
    })
    return friend
  }

  async createFriend(userId: number, friendId: number): Promise<EFriend.Basic> {
    const friendProfile = await this.prisma.session_userprofile.findUnique({
      where: { user_id: friendId },
    })

    if (!friendProfile) {
      throw new NotFoundException('친구 프로필을 찾을 수 없습니다.')
    }

    const [user_friend, _friend_user] = await this.prisma.$transaction([
      this.prisma.friend_friend.create({
        data: { user_id: userId, friend_id: friendId, is_favorite: false },
      }),
      this.prisma.friend_friend.create({
        data: { user_id: friendId, friend_id: userId, is_favorite: false },
      }),
    ])

    return {
      ...user_friend,
      friend: friendProfile,
    }
  }

  async updateFriendFavorite(userId: number, friendId: number, isFavorite: boolean): Promise<EFriend.Basic> {
    const friend = await this.prisma.friend_friend.update({
      where: { user_id_friend_id: { user_id: userId, friend_id: friendId } },
      data: { is_favorite: isFavorite },
      include: EFriend.Basic.include,
    })
    return friend
  }

  async deleteFriend(userId: number, friendId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.friend_friend.delete({
        where: { user_id_friend_id: { user_id: userId, friend_id: friendId } },
      }),
      this.prisma.friend_friend.delete({
        where: { user_id_friend_id: { user_id: friendId, friend_id: userId } },
      }),
    ])
  }
}
