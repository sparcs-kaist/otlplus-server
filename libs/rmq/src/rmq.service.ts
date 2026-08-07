// @otl/rmq/rmq.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import settings from '@otl/rmq/settings'
import * as amqplib from 'amqplib'

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name)

  private connection: amqplib.ChannelModel | undefined

  private channel: amqplib.Channel | undefined

  async onModuleInit() {
    try {
      this.connection = await this.createConnection()
      this.channel = await this.createChannel()
      this.logger.log('✅ RabbitMQ connection initialized')
    } catch (err) {
      this.logger.error('❌ Failed to initialize RabbitMQ connection', err)
      // 연결 실패 시 프로세스를 종료하거나 재시도 로직을 구현할 수 있습니다.
      throw err
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close()
      this.logger.log('❎ RabbitMQ connection closed')
    }
  }

  async createConnection(): Promise<amqplib.ChannelModel> {
    if (this.connection) {
      this.logger.warn('RabbitMQ connection already exists. Returning existing connection.')
      return this.connection
    }
    try {
      const { url } = settings().getRabbitMQConfig()
      if (!url) {
        throw new Error('RabbitMQ URL is not defined in the environment variables.')
      }
      this.connection = await amqplib.connect(url)
      this.connection.on('error', (err) => {
        this.logger.error('💥 RabbitMQ Connection Error', err)
      })
      this.connection.on('close', () => {
        this.logger.warn('❗️ RabbitMQ Connection Closed. Attempting to reconnect...')
        // 재연결 로직을 추가할 수 있습니다.
      })
      this.logger.log('✅ Connected to RabbitMQ')
      return this.connection
    } catch (err) {
      this.logger.error('❌ Failed to connect to RabbitMQ', err)
      // 연결 실패 시 프로세스를 종료하거나 재시도 로직을 구현할 수 있습니다.
      throw err
    }
  }

  /**
   * 현재 활성화된 RabbitMQ 연결을 반환합니다.
   * @returns {amqplib.Connection} amqplib Connection 객체
   */
  public async getConnection(): Promise<amqplib.ChannelModel> {
    if (!this.connection) {
      return await this.createConnection()
    }
    return this.connection
  }

  public async createChannel(): Promise<amqplib.Channel> {
    if (this.channel) {
      this.logger.warn('RabbitMQ channel already exists. Returning existing channel.')
      return this.channel
    }
    try {
      if (!this.connection) {
        this.connection = await this.createConnection()
      }
      this.channel = await this.connection.createChannel()
      this.channel.on('error', (err) => {
        this.logger.error('💥 RabbitMQ Channel Error', err)
      })
      this.logger.log('✅ RabbitMQ Channel created')
      return this.channel
    } catch (err) {
      this.logger.error('❌ Failed to create RabbitMQ channel', err)
      throw err
    }
  }

  public async getChannel(): Promise<amqplib.Channel> {
    if (!this.channel) {
      this.channel = await this.createChannel()
    }
    return this.channel
  }
}
