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
    this.secret_key = secret_key.encode();
  }

  _sign_payload(payload, append_timestamp = true) {}
}
