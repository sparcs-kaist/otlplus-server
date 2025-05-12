import { IUser } from './IUser';
export declare namespace IFriend {
  interface Basic {
    id: number;
    user_profile: IUser.Basic;
    begin: Date;
    isFavorite: boolean;
  }
  interface LectureFriends {
    friendsSameLecture: IUser.Basic[];
    friendsTakenSameProfessor: IUser.Basic[];
    friendsTakenOtherProfessor: IUser.Basic[];
  }
  class CreateDto {
    user_id: number;
  }
  class UpdateFavoriteDto {
    isFavorite: boolean;
  }
}
