import { Injectable, Logger } from '@nestjs/common'
import settings from '@otl/scholar-sync/settings'
import { WebClient } from '@slack/web-api'

@Injectable()
export class SlackNotiService {
  private readonly logger = new Logger(SlackNotiService.name)

  private client?: WebClient

  constructor() {
    const key = settings().syncConfig().slackKey
    if (key) {
      // 알림은 부가 기능이다. Slack이 느리거나 실패해도 동기화가 기다리지 않도록 빨리 포기한다.
      // (기본값은 약 30분 동안 10번 재시도하고, 요청 한도에 걸리면 Retry-After만큼 기다린다.)
      this.client = new WebClient(key, {
        retryConfig: { retries: 1 },
        timeout: 10_000,
        rejectRateLimitedCalls: true,
      })
    }
    else console.info('No slack key, logging to console.')
  }

  /** 전송에 실패해도 예외를 던지지 않는다. 실패하면 로그만 남기고 메시지는 버린다. */
  async sendSyncNoti(text: string): Promise<void> {
    if (!this.client) {
      console.info(text)
      return
    }
    try {
      await this.client.chat.postMessage({
        channel: '#otl-db-sync',
        text,
      })
    }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      this.logger.warn(`Slack notification dropped: ${message}`)
    }
  }
}
