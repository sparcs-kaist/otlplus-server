export namespace INotice {
  export interface Basic {
    title: string;
    content: string;
    start_time: Date;
    end_time: Date;
  }

  /**
   * @deprecated
   */
  export class GetDto {
    // @IsString()
    // time?: string;
    // @IsString()
    // order?: string;
  }
}
