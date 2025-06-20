import {
  Body, Controller, Get, HttpException, Param, Patch, Put, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import {
  ICourse, ILecture, IReview, IUser,
} from '@otl/server-nest/common/interfaces'
import {
  v2toJsonLectureWithCourseDetail,
  v2toJsonTakenLectures,
} from '@otl/server-nest/common/serializer/lecture.serializer'
import { v2toJsonLikedReviews } from '@otl/server-nest/common/serializer/review.serializer'
import { session_userprofile } from '@prisma/client'

import { LectureRepository, WishlistRepository } from '@otl/prisma-client'

import { LecturesService } from '../lectures/lectures.service'
import { UserService } from './user.service'

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':user_id/taken-courses')
  async getUserTakenCourses(
    @Query() query: IUser.TakenCoursesQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    if (userId === user.id) {
      return await this.userService.getUserTakenCourses(query, user)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':user_id/liked-reviews')
  async getUserLikedReviews(
    @Query() query: IUser.ReviewLikedQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked[]> {
    if (userId === user.id) {
      return await this.userService.getUserLikedReviews(user, userId, query)
    }
    throw new HttpException('Can\'t find user', 401)
  }
}

@Controller('api/v2/users')
export class UserV2Controller {
  constructor(
    private readonly userService: UserService,
    private readonly lectureService: LecturesService,
    private readonly wishlistRepository: WishlistRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  @Get(':userId/wishlist')
  async getUserWishlist(
    @Param('userId') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ILecture.v2Response2[]> {
    if (userId === user.id) {
      const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId)
      const WishlistWithLectures = await this.wishlistRepository.getWishlistWithLectures(wishlist.id)
      const rawlectures = WishlistWithLectures?.timetable_wishlist_lectures
      const lectureIds = rawlectures?.map((item) => item.lecture_id) ?? []
      const lectures = await this.lectureService.getLecturesByIds(lectureIds)
      const lecturesWithCourse = await this.lectureService.v2attachCourseToDetails(lectures)
      return Promise.all(
        lecturesWithCourse.map((lecture) => v2toJsonLectureWithCourseDetail(lecture, this.lectureRepository, user, false, this.wishlistRepository)),
      )
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Patch(':userId/wishlist')
  async addOrRemoveLectureToWishlist(
    @Param('userId') userId: number,
    @Body() wishlistBody: IUser.v2AddOrRemoveWishlistDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    if (userId === user.id) {
      const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId)

      if (wishlistBody.mode === 'add') {
        await this.wishlistRepository.addLecture(wishlist.id, wishlistBody.lectureId)
        return
      }

      if (wishlistBody.mode === 'delete') {
        await this.wishlistRepository.removeLecture(wishlist.id, wishlistBody.lectureId)
        return
      }
    }

    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':userId/lectures')
  async getUserLectures(
    @Param('userId') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IUser.v2TakenLectures> {
    if (userId === user.id) {
      const lectures = await this.lectureRepository.getTakenLectures(user)
      const likedNum = (await this.userService.getUserLikedReviews(user, userId, {})).length
      const profile = await this.userService.getProfile(user)
      const writtenReviews = profile.reviews
      const ReviewIds = writtenReviews.map((reviews) => reviews.lecture.id)
      return v2toJsonTakenLectures(lectures, likedNum, ReviewIds)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':userId/reviews/liked')
  async getUserLikedReviews(
    @Param('userId') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IUser.v2LikedReviews[]> {
    if (userId === user.id) {
      const likedReviews = await this.userService.getUserLikedReviews(user, userId, {})
      return await Promise.all(likedReviews.map((likedReview) => v2toJsonLikedReviews(likedReview)))
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':userId/info')
  async getUserInfo(@Param('userId') userId: number, @GetUser() user: session_userprofile): Promise<IUser.v2UserInfo> {
    if (userId === user.id) {
      return this.userService.v2getProfile(user)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Put(':userId/interested-majors')
  async modifyInterestedInfo(
    @Param('userId') userId: number,
    @Body() body: IUser.v2ModifyInterestedMajorDepartmentIdsDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    if (userId === user.id) {
      this.userService.v2ModifyInterestedMajorDepartments(user, body.interestedMajorDepartmentIds)
      return
    }
    throw new HttpException('Can\'t find user', 401)
  }
}
