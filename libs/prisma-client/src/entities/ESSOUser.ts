export namespace ESSOUser {
  /**
   * KAIST 구성원 정보 모델 (v1 기준)
   */
  export class KaistInfo {
    /** 학번 (Student Number) */
    ku_std_no!: string

    /** KAIST UID (고유 사용자 ID) */
    kaist_uid!: string

    /** 학적 상태 (예: '재학', '휴학' 등) */
    ku_psft_user_status_kor!: string

    /** 사용자 유형 (예: 'S' = Student, 'E' = Employee 등) */
    employeeType!: string

    /** 사용자 분류 (예: 'Student', 'Faculty' 등) */
    ku_person_type!: string

    /** 소속 조직 ID (학과 코드 등, 예: '4423') */
    ku_kaist_org_id!: string

    /** 학적 상태 (영문, 예: 'Enrollment', 'Leave') */
    ku_psft_user_status!: string

    /** 학사 프로그램 코드 (예: 학부, 석사, 박사 구분. '0'은 학부) */
    ku_acad_prog_code!: string

    /** 생년월일 (YYYY-MM-DD) */
    ku_born_date!: string

    /** 사용자 분류 한글 (예: '학생', '교수') */
    ku_person_type_kor!: string

    /** 이름(이름 부분) (예: 'HyeokTae') */
    sn!: string

    /** 학교 이메일 주소 */
    mail!: string

    /** 표시 이름 (예: 'Kwon, HyeokTae') */
    displayname!: string

    /** 이름(성 부분) (예: 'Kwon') */
    givenname!: string

    /** 성별 ('M' 또는 'F') */
    ku_sex!: string

    /** 한글 이름 (예: '권혁태') */
    ku_kname!: string
  }

  /**
   * KAIST 구성원 정보 모델 (v2 기준)
   */
  export class KaistV2Info {
    /** KAIST UID (고유 사용자 ID) */
    kaist_uid!: string

    /** 사용자 영문 이름 (예: 'Kwon, HyeokTae') */
    user_eng_nm!: string

    /** 로그인 유형 (예: 'L004'은 일반적인 로그인 코드로 추정) */
    login_type!: string

    /** 학과 이름 (한글, 예: '전기및전자공학부') */
    std_dept_kor_nm!: string

    /** 학과 이름 (영문, 예: 'School of Electrical Engineering') */
    std_dept_eng_nm!: string

    /** 사용자 이름 (한글, 예: '권혁태') */
    user_nm!: string

    /** 사무실 전화번호 (학생은 일반적으로 null) */
    busn_phone!: string | null

    /** 학적 상태 (한글, 예: '재학') */
    std_status_kor!: string

    /** 학과 ID (조직 코드, 예: '4423') */
    std_dept_id!: string

    /** EBS 시스템에서의 사용자 상태 (null일 수 있음) */
    ebs_user_status_kor!: string | null

    /** 학번 (예: '20180036') */
    std_no!: string

    /** 로그인 ID (포탈 계정 ID, 예: 'jj6014') */
    user_id!: string

    /** 캠퍼스 구분 코드 (예: 'D'는 대전 캠퍼스로 추정) */
    camps_div_cd!: string

    /** 소속 구분 코드 (예: 'S'는 학생) */
    socps_cd!: string

    /** 이메일 주소 */
    email!: string

    /** 학사 프로그램 코드 (예: '0'은 학부) */
    std_prog_code!: string

    /** KAIST 조직 ID (학과 코드와 동일한 경우가 많음, 예: '4423') */
    kaist_org_id!: string
  }

  export class SSOUser {
    /** 사용자가 SSO 전체에서 고유하게 받은 ID입니다. 30자를 초과하지 않습니다. */
    uid!: string

    /** RP에서 사용자를 식별할 수 있는 고유한 값입니다. */
    sid!: string

    /** 사용자의 이름입니다. 30자를 초과하지 않습니다. */
    first_name!: string

    /** 사용자의 성입니다. 30자를 초과하지 않습니다. */
    last_name!: string

    /** 사용자의 이메일 주소입니다. 인증된 이메일인지는 보장하지 않으며, 254자를 초과하지 않습니다. */
    email!: string

    /** 사용자의 성별입니다. *M (남성), *F (여성), *H (숨김), *E (기타) 또는 30자를 초과하지 않는 성별을 나타내는 문자열입니다. */
    gender!: string

    /** 사용자의 생일입니다. YYYY-MM-DD 형식의 날짜 또는 빈 문자열 값입니다. */
    birthday?: Date

    /** 사용자의 포인트를 나타냅니다. 개발 전용 서비스와 실제 포인트 값은 분리되어 적용됩니다. */
    point!: number

    /** 사용자가 특별한 권한이 있는 경우 이를 표시합니다. 사용자가 테스트 기능이 있는 경우 TEST 문자열이, SPARCS 회원인 경우 SPARCS 문자열이 포함되어 있습니다. */
    flags!: string[]

    /** 사용자의 페이스북 고유 ID입니다. 연동하지 않았을 경우 빈 문자열입니다. */
    facebook_id!: string

    /** 사용자의 트위터 고유 ID입니다. 연동하지 않았을 경우 빈 문자열입니다. */
    twitter_id!: string

    /** 사용자의 KAIST 고유 ID입니다. 연동하지 않았을 경우 빈 문자열입니다. */
    kaist_id!: string

    /** 사용자의 KAIST Portal 데이터입니다. */
    kaist_info!: KaistInfo

    /** kaist_info를 업데이트한 날짜입니다. YYYY-MM-DD 형식의 날짜 또는 빈 문자열 값입니다. */
    kaist_info_time?: Date

    /** 사용자의 KAIST V2 정보입니다. */
    kaist_v2_info!: KaistV2Info

    /** kaist_info_v2를 업데이트한 날짜입니다. YYYY-MM-DD 형식의 날짜 또는 빈 문자열 값입니다. */
    kaist_v2_info_time?: Date

    /** 사용자의 SPARCS ID입니다. SPARCS 회원이 아닌 경우 빈 문자열 값입니다. */
    sparcs_id!: string
  }
}
