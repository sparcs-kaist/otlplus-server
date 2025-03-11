
import { IUser } from './IUser';

export namespace IFriend {

	export interface Basic{
		id: number ; // friend_friend.id
		user_profile: IUser.Basic;	
		begin: Date;
		isFavorite: boolean; //즐겨찾기
	}
	

}