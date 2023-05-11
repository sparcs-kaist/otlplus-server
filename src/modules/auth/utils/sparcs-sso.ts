export class Client {
  private readonly SERVER_DOMAIN = 'https://sparcssso.kaist.ac.kr/';
  private readonly BETA_DOMAIN = 'https://ssobeta.sparcs.org/';
  private DOMAIN = '';

  readonly API_PREFIX = 'api/';
  readonly VERSION_PREFIX = 'v2/';
  readonly TIMEOUT = 60;

  private URLS = {
    token_require: 'token/require/',
    token_info: 'token/info/',
    logout: 'logout/',
    unregister: 'unregister/',
    point: 'point/',
    notice: 'notice/',
  };
  constructor(
    private client_id: string,
    private secret_key: string,
    private is_beta: boolean = false,
    private server_addr: string = '',
  ) {
    this.DOMAIN = is_beta ? this.BETA_DOMAIN : this.SERVER_DOMAIN;
    this.DOMAIN = server_addr ? server_addr : this.DOMAIN;

    const base_url = this.DOMAIN + this.API_PREFIX + this.VERSION_PREFIX;
    for (const k in this.URLS) {
      this.URLS[k] = base_url + this.URLS[k];
    }
    this.client_id = client_id;
    this.secret_key = encodeURIComponent(secret_key);
  }

  _sign_payload(payload: Array<string | number>, append_timestamp = true): any {
    const timestamp = Math.floor(Date.now() / 1000);
    if (append_timestamp) {
      payload.push(timestamp);
    }
  }

  _validate_sign(
    payload: Array<string | number>,
    timestamp: number,
    sign: any,
  ): any {}

  _post_data(url: any, data: any): any {}
  get_login_params(): any {}
  get_user_info(code: any): any {}
  get_logout_url(sid: any, redirect_uri: any): any {}
  get_point(sid: any): any {}
  modify_point(
    sid: any,
    delta: any,
    message: any,
    lower_bound: number = 0,
  ): any {}
  get_notice(
    offset: number = 0,
    limit: number = 3,
    date_after: number = 0,
  ): any {}
  parse_unregister_request(data_dict: any): any {}
}
