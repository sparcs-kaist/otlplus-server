import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';

async function startWorker() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('token_lookup_queue', { durable: true });

  console.log('Token Lookup Worker started...');

  channel.consume('token_lookup_queue', async (msg) => {
    if (msg) {
      const { userId, message } = JSON.parse(msg.content.toString());
      console.log(`Looking up FCM token for user ${userId}...`);

      // 가짜 토큰 조회 (실제 DB에서 조회해야 함)
      const pushToken = `fcm_token_for_${userId}`;

      if (pushToken) {
        await channel.assertQueue('push_notification_queue', { durable: true });
        channel.sendToQueue('push_notification_queue', Buffer.from(JSON.stringify({ pushToken, message })), {
          persistent: true,
        });
        console.log(`Token found! Added job to push_notification_queue for user ${userId}`);
      }

      channel.ack(msg);
    }
  });
}

startWorker();
