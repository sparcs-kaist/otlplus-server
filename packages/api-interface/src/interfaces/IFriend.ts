import { ICourse } from './ICourse';
import { ILecture } from './ILecture';
import { IUser } from './IUser';

export namespace IFriend {

	export interface Basic{
		id: number ; // friend_friend.id
		user_profile: IUser.Profile;	
		begin: Date;
		isFavorite: boolean; //즐겨찾기
	}
	
	export interface ClassMate {
		id: number; //  friend_friend.id
		user_id: number // 본인의 session_user_profile_id
		friend_profile: IUser.Profile;	
		lecture: ILecture.Basic
		course: ICourse.Basic
	}
	
}