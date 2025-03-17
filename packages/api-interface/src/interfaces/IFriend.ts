import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsNotEmpty,
	IsNumber
} from 'class-validator';
import { IUser } from './IUser';



export namespace IFriend {

	export interface Basic{
		id: number ; // friend_friend.id
		user_profile: IUser.Basic;	
		begin: Date;
		isFavorite: boolean; //즐겨찾기
	}

	export class CreateDto {
		@IsNotEmpty()
		@IsNumber()
		@Type(() => Number)
		user_id!: number;
	}

	export class UpdateFavoriteDto {
		@IsNotEmpty()
		@IsBoolean()
		@Type(() => Boolean)
		isFavorite!: boolean;
	}


}