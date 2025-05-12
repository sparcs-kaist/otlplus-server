export declare namespace ESSOUser {
  class KaistInfo {
    ku_std_no: string;
    kaist_uid: string;
    ku_psft_user_status_kor: string;
    employeeType: string;
    ku_person_type: string;
    ku_kaist_org_id: string;
    ku_psft_user_status: string;
    ku_acad_prog_code: string;
    ku_born_date: string;
    ku_person_type_kor: string;
    sn: string;
    mail: string;
    displayname: string;
    givenname: string;
    ku_sex: string;
    ku_kname: string;
  }
  class SSOUser {
    uid: string;
    sid: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    birthday?: Date;
    point: number;
    flags: string[];
    facebook_id: string;
    twitter_id: string;
    kaist_id: string;
    kaist_info: KaistInfo;
    kaist_info_time?: Date;
    sparcs_id: string;
  }
}
