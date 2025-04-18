import { ESSOUser } from '@otl/prisma-client/entities';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

// CONVERT SPARCS SSO V2 Client Version 1.1 TO TYPESCRIPT
// VALID ONLY AFTER ----(NOT VALID) ----
// Made by SPARCS SSO Team

interface Urls {
  [key: string]: string;
}
interface Params {
  [key: string]: string;
}
export class Client {
  private readonly SERVER_DOMAIN: string = 'https://sparcssso.kaist.ac.kr/';
  private readonly BETA_DOMAIN: string = 'https://ssobeta.sparcs.org/';
  private DOMAIN: string = '';

  private readonly API_PREFIX: string = 'api/';
  private readonly VERSION_PREFIX: string = 'v2/';
  private readonly TIMEOUT: number = 60;

  private URLS: Urls = {
    token_require: 'token/require/',
    token_info: 'token/info/',
    logout: 'logout/',
    unregister: 'unregister/',
    point: 'point/',
    notice: 'notice/',
  };
  private client_id: string;
  private secret_key: Buffer;

  constructor(
    client_id: string,
    secret_key: string,
    private is_beta: boolean = false,
    private server_addr: string = '',
  ) {
    /*Initialize SPARCS SSO Client
    :param client_id: your client id
    :param secret_key: your secret key
    :param is_beta: true iff you want to use SPARCS SSO beta server
    :param server_addr: SPARCS SSO server addr (only for testing)*/
    this.DOMAIN = is_beta ? this.BETA_DOMAIN : this.SERVER_DOMAIN;
    this.DOMAIN = server_addr || this.DOMAIN;

    const base_url = `${this.DOMAIN}${this.API_PREFIX}${this.VERSION_PREFIX}`;
    this.URLS = Object.entries(this.URLS).reduce((acc, [key, value]) => {
      acc[key] = `${base_url}${value}`;
      return acc;
    }, {} as Urls);
    this.client_id = client_id;
    this.secret_key = Buffer.from(secret_key, 'utf-8');
  }

  private _sign_payload(payload: Array<any>, append_timestamp: boolean = true): [string, number] {
    const timestamp: number = Math.floor(Date.now() / 1000);
    if (append_timestamp) {
      payload.push(timestamp.toString());
    }
    const msg: Buffer = Buffer.from(payload.join(''), 'utf-8');
    const sign: string = crypto.createHmac('md5', this.secret_key).update(msg).digest('hex');
    return [sign, timestamp];
  }

  private _validate_sign(payload: any[], timestamp: string, sign: string): boolean {
    const [sign_client, time_client]: [string, number] = this._sign_payload(payload, false);
    if (Math.abs(Number(time_client) - Number(timestamp)) > 10) {
      return false;
    } else if (!crypto.timingSafeEqual(Buffer.from(sign_client, 'utf-8'), Buffer.from(sign, 'utf-8'))) {
      return false;
    }
    return true;
  }

  private async _post_data(url: any, data: any): Promise<ESSOUser.SSOUser> {
    /**
     *@SSO
     *querystring.stringify(data)인지 .toString('utf8')붙여야 하는지 확인 필요
     */
    try {
      const r: AxiosResponse = await axios.post(url, querystring.stringify(data));
      if (r.status === 400) {
        throw new Error('INVALID_REQUEST');
      } else if (r.status === 403) {
        throw new Error('NO_PERMISSION');
      } else if (r.status !== 200) {
        throw new Error('UNKNOWN_ERROR');
      }

      const result = r.data;
      result.kaist_info = result.kaist_info ? JSON.parse(result.kaist_info) : {};
      return result as ESSOUser.SSOUser;
    } catch (e) {
      console.error(e);
      throw new Error('INVALID_OBJECT');
    }
  }

  public get_login_params(request_url: string): { url: string; state: string } {
    /*
    Get login parameters for SPARCS SSO login
    :returns: [url, state] where url is a url to redirect user,
        and state is random string to prevent CSRF
    */
    /**
     * @SSO
     * randomBytes에 10? 5? 둘중 어떤걸 넘겨줄지. gpt는 5라고 하고 파이썬은 token_hex(10) 10 같긴 한데....혹시나 해서
     */
    const state: string = crypto.randomBytes(10).toString('hex');
    const allowedPreferredUris: { [key: string]: string } = {
      'otl.sparcs.org': 'https://otl.sparcs.org/session/login/callback/',
      'otl.kaist.ac.kr': 'https://otl.kaist.ac.kr/session/login/callback/',
      'api.otl.dev.sparcs.org': 'https://api.otl.dev.sparcs.org/session/login/callback/',
      'otl-stage.sparcsandbox.com': 'https://otl-stage.sparcsandbox.com/session/login/callback/',
      'localhost:8000': 'http://localhost:8000/session/login/callback/',
    };
    const preferred_url = allowedPreferredUris[request_url] || 'https://otl.sparcs.org/session/login/callback/';
    const params: Params = {
      client_id: this.client_id,
      state: state,
      preferred_url: preferred_url,
    };
    const url: string = `${this.URLS['token_require']}?${querystring.stringify(params)}`;
    return { url, state };
  }

  public async get_user_info(code: string): Promise<ESSOUser.SSOUser> {
    /*
    Exchange a code to user information
    :param code: the code that given by SPARCS SSO server
    :returns: a dictionary that contains user information
    */
    const [sign, timestamp]: [string, number] = this._sign_payload([code]);
    const params = {
      client_id: this.client_id,
      code: code,
      timestamp: timestamp,
      sign: sign,
    };
    return await this._post_data(this.URLS.token_info, params);
  }

  public get_logout_url(sid: string, redirect_uri: string): string {
    /*
    Get a logout url to sign out a user
    :param sid: the user's service id
    :param redirect_uri: a redirect uri after the user sign out
    :returns: the final url to sign out a user
    */
    const [sign, timestamp]: [string, number] = this._sign_payload([sid, redirect_uri]);
    const params = {
      client_id: this.client_id,
      sid: sid,
      timestamp: timestamp,
      redirect_uri: redirect_uri,
      sign: sign,
    };
    return `${this.URLS['logout']}?${querystring.stringify(params)}`;
  }

  public async get_notice(offset: number = 0, limit: number = 3, date_after: number = 0): Promise<any> {
    /*
    Get some notices from SPARCS SSO
    :param offset: a offset to fetch from
    :param limit: a number of notices to fetch
    :param date_after: an oldest date; YYYYMMDD formated string
    :returns: a server response; check the full docs
    */
    const params = { offset: offset, limit: limit, date_after: date_after };
    const r = await axios.get(this.URLS['notice'], { params: params });
    return r.data;
  }

  public parse_unregister_request(data_dict: any): string {
    /*
    Parse unregister request from SPARCS SSO server
    :param data_dict: a data dictionary that the server sent
    :returns: the user's service id
    :raises RuntimeError: raise iff the request is invalid
    */
    const client_id: string = data_dict.clietn_id || '';
    const sid: string = data_dict.sid || '';
    const timestamp: string = data_dict.timestamp || '';
    const sign: string = data_dict.sign || '';

    if (client_id !== this.client_id) {
      throw new Error('INVALID_REQUEST');
    } else if (!this._validate_sign([sid], timestamp, sign)) {
      throw new Error('INVALID_REQUEST');
    }

    return sid;
  }
}
