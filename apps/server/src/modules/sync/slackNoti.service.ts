import { Injectable } from '@nestjs/common'
import settings from '@otl/server-nest/settings'
import { WebClient } from '@slack/web-api'

@Injectable()
export class SlackNotiService {
  private client?: WebClient

  constructor() {
    const key = settings().syncConfig().slackKey
    if (key) this.client = new WebClient(key)
    else console.info('No slack key, logging to console.')
  }

  async sendSyncNoti(text: string) {
    if (this.client) {
      await this.client.chat.postMessage({
        channel: '#otl-db-sync',
        text,
      })
    }
    else console.info(text)
  }
}
