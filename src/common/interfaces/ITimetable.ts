export namespace ITimetable {
  export interface IClasstime {
    id: number;
    day: number;
    begin: Date;
    end: Date;
    type: string;
    building_id: string | null;
    building_full_name: string | null;
    building_full_name_en: string | null;
    room_name: string | null;
    unit_time: number | null;
    lecture_id: number | null;
    // Additional properties as needed
  }
  // Other interfaces as needed...
}
