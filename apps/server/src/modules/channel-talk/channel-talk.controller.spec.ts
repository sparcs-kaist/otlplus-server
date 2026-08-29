import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { createHmac } from 'crypto'
import request from 'supertest'

import { ChannelTalkSignatureGuard } from './channel-talk-signature.guard'
import { CHANNEL_TALK_COURSE_CATALOG, CHANNEL_TALK_FUNCTION, CHANNEL_TALK_SIGNING_KEY } from './channel-talk.contract'
import { ChannelTalkController } from './channel-talk.controller'
import { ChannelTalkService } from './channel-talk.service'

const signingKey = '00112233445566778899aabbccddeeff'

const emptyCourseCatalog = {
  getCourses: async () => [],
  getReviewsByCourseId: async () => [],
}

describe('ChannelTalk function endpoint', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [ChannelTalkController],
      providers: [
        ChannelTalkService,
        ChannelTalkSignatureGuard,
        { provide: CHANNEL_TALK_COURSE_CATALOG, useValue: emptyCourseCatalog },
        { provide: CHANNEL_TALK_SIGNING_KEY, useValue: signingKey },
      ],
    }).compile()

    app = moduleFixture.createNestApplication({ rawBody: true })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('accepts a signed discovery request through PUT /functions/v1', async () => {
    const rawBody = JSON.stringify({
      method: CHANNEL_TALK_FUNCTION.discover,
      params: {},
      systemVersion: 'v1',
    })
    const signature = createHmac('sha256', Buffer.from(signingKey, 'hex')).update(rawBody).digest('base64')

    const response = await request(app.getHttpServer())
      .put('/functions/v1')
      .set('Content-Type', 'application/json')
      .set('x-signature', signature)
      .send(rawBody)
      .expect(200)

    expect(response.body.result.success).toBe(true)
  })

  it('rejects a request signed for a different body', async () => {
    const signature = createHmac('sha256', Buffer.from(signingKey, 'hex')).update('{}').digest('base64')

    await request(app.getHttpServer())
      .put('/functions/v1')
      .set('Content-Type', 'application/json')
      .set('x-signature', signature)
      .send(
        JSON.stringify({
          method: CHANNEL_TALK_FUNCTION.discover,
          params: {},
          systemVersion: 'v1',
        }),
      )
      .expect(401)
  })
})
