import { Logger } from '@nestjs/common'

import { SlackNotiService } from './slackNoti.service'

let mockSlackKey: string | undefined = 'xoxb-test'
const mockPostMessage = jest.fn()
const mockWebClient = jest.fn().mockImplementation(() => ({ chat: { postMessage: mockPostMessage } }))

// jest moduleNameMapper에 @otl/scholar-sync가 없어서 virtual mock으로 대신한다.
jest.mock(
  '@otl/scholar-sync/settings',
  () => ({
    __esModule: true,
    default: () => ({ syncConfig: () => ({ slackKey: mockSlackKey }) }),
  }),
  { virtual: true },
)
jest.mock('@slack/web-api', () => ({
  WebClient: function WebClient(...args: unknown[]) {
    return mockWebClient(...args)
  },
}))

describe('SlackNotiService', () => {
  let warn: jest.SpyInstance

  beforeEach(() => {
    mockSlackKey = 'xoxb-test'
    mockPostMessage.mockReset()
    mockWebClient.mockClear()
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('재시도를 줄이고, 시간 제한을 두고, 요청 한도에 걸리면 기다리지 않도록 WebClient를 만든다', () => {
    expect(new SlackNotiService()).toBeInstanceOf(SlackNotiService)
    expect(mockWebClient).toHaveBeenCalledWith('xoxb-test', {
      retryConfig: { retries: 1 },
      timeout: 10_000,
      rejectRateLimitedCalls: true,
    })
  })

  it('#otl-db-sync 채널로 메시지를 보낸다', async () => {
    mockPostMessage.mockResolvedValue({ ok: true })
    await new SlackNotiService().sendSyncNoti('hello')
    expect(mockPostMessage).toHaveBeenCalledWith({ channel: '#otl-db-sync', text: 'hello' })
    expect(warn).not.toHaveBeenCalled()
  })

  it('전송이 실패해도 예외를 던지지 않고 경고 로그만 남긴다', async () => {
    mockPostMessage.mockRejectedValue(new Error('An API error occurred: invalid_auth'))
    await expect(new SlackNotiService().sendSyncNoti('hello')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledWith('Slack notification dropped: An API error occurred: invalid_auth')
  })

  it('요청 한도에 걸린 메시지는 버린다', async () => {
    mockPostMessage.mockRejectedValue(
      new Error('A rate-limit has been reached, you may retry this request in 30 seconds'),
    )
    await expect(new SlackNotiService().sendSyncNoti('hello')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('await하지 않고 호출해도 처리되지 않은 Promise 거부가 생기지 않는다', async () => {
    const unhandled = jest.fn()
    process.on('unhandledRejection', unhandled)
    mockPostMessage.mockRejectedValue(new Error('network down'))

    // sync.service.ts의 syncTakenLecture·syncDegree처럼 await 없이 호출하는 경우
    // eslint-disable-next-line no-void
    void new SlackNotiService().sendSyncNoti('hello')
    await new Promise((resolve) => {
      setImmediate(resolve)
    })

    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('Slack 키가 없으면 콘솔에만 출력한다', async () => {
    mockSlackKey = undefined
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined)
    const service = new SlackNotiService()
    await service.sendSyncNoti('hello')
    expect(mockWebClient).not.toHaveBeenCalled()
    expect(info).toHaveBeenLastCalledWith('hello')
    info.mockRestore()
  })
})
