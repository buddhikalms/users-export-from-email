import { Queue, QueueEvents } from "bullmq";
import net from "node:net";

export const EMAIL_SYNC_QUEUE_NAME = "email-sync";

const globalForQueue = globalThis as unknown as {
  emailSyncQueue?: Queue;
  emailSyncQueueEvents?: QueueEvents;
};

export function getRedisConnectionOptions() {
  return {
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export async function assertRedisAvailable(timeoutMs = 1000) {
  const redisUrl = new URL(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");
  const host = redisUrl.hostname || "127.0.0.1";
  const port = Number(redisUrl.port || "6379");

  await new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Redis is not reachable at ${host}:${port}. Start Redis before running background sync.`));
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve();
    });

    socket.once("error", () => {
      clearTimeout(timeout);
      reject(new Error(`Redis is not reachable at ${host}:${port}. Start Redis before running background sync.`));
    });
  });
}

export function getEmailSyncQueue() {
  if (!globalForQueue.emailSyncQueue) {
    globalForQueue.emailSyncQueue = new Queue(EMAIL_SYNC_QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
      defaultJobOptions: {
        attempts: Number(process.env.EMAIL_SYNC_JOB_ATTEMPTS ?? "2"),
        backoff: {
          type: "exponential",
          delay: Number(process.env.EMAIL_SYNC_RETRY_DELAY_MS ?? "10000"),
        },
        removeOnComplete: { age: 60 * 60 * 24, count: 500 },
        removeOnFail: { age: 60 * 60 * 24 * 7, count: 1000 },
      },
    });
  }

  return globalForQueue.emailSyncQueue;
}

export function getEmailSyncQueueEvents() {
  if (!globalForQueue.emailSyncQueueEvents) {
    globalForQueue.emailSyncQueueEvents = new QueueEvents(EMAIL_SYNC_QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
    });
  }

  return globalForQueue.emailSyncQueueEvents;
}
