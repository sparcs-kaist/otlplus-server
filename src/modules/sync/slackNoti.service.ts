import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import settings from '@src/settings';

@Injectable()
export class SlackNotiService {
  private client?: WebClient;
  constructor() {
    const key = settings().syncConfig().slackKey;
    if (key) this.client = new WebClient(key);
    else console.warn('No slack key, logging to console.');
  }

  async sendSyncNoti(text: string) {
    if (this.client)
      await this.client.chat.postMessage({
        channel: '#otl-db-sync',
        text,
      });
    else console.log(text);
  }
}
