import dotenv from 'dotenv';
import axios from 'axios';
import amqp from 'amqplib';
import { dotEnvOptions } from '@otl/noti-server/dotenv-options';

dotenv.config(dotEnvOptions);
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

async function sendPushNotification(pushToken: string, message: string) {
  try {
    await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: pushToken,
        notification: { title: 'New Message', body: message },
      },
      {
        headers: { Authorization: `key=${FCM_SERVER_KEY}`, 'Content-Type': 'application/json' },
      },
    );
    console.log(`Push notification sent to ${pushToken}`);
  } catch (error) {
    console.error(`Failed to send push notification:`, error);
  }
}

async function startWorker() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('push_notification_queue', { durable: true });

  console.log('Push Notification Worker started...');

  channel.consume('push_notification_queue', async (msg) => {
    if (msg) {
      const { pushToken, message } = JSON.parse(msg.content.toString());
      await sendPushNotification(pushToken, message);
      channel.ack(msg);
    }
  });
}

startWorker();
