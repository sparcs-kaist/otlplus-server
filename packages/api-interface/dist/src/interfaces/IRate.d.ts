export declare namespace IRate {
  interface Basic {
    id: number;
    user_id: number;
    score: number;
    version: string;
    created_datetime: Date | null;
  }
  class CreateDto {
    score: number;
  }
}
