import { Queue } from "bullmq";
import net from "node:net";

import { getRedisConnection } from "@/lib/queues/connection";
import { type QueueName, QUEUE_NAMES } from "@/lib/queues/queue-names";

export type QueueSummary = {
  name: QueueName;
  status: "running" | "paused" | "unavailable";
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
  paused: number;
  throughputPerMinute: number;
  averageProcessingTimeMs: number;
  oldestWaitingJob: string | null;
  workers: number;
  workerConcurrency: number;
  failureRate: number;
  retryCount: number;
};

export function getQueue(queueName: QueueName) {
  return new Queue(queueName, { connection: getRedisConnection() });
}

function unavailableQueueSummary(name: QueueName): QueueSummary {
  return {
    name,
    status: "unavailable",
    waiting: 0,
    active: 0,
    delayed: 0,
    completed: 0,
    failed: 0,
    paused: 0,
    throughputPerMinute: 0,
    averageProcessingTimeMs: 0,
    oldestWaitingJob: null,
    workers: 0,
    workerConcurrency: 0,
    failureRate: 0,
    retryCount: 0,
  };
}

function unavailableQueueSummaries() {
  return QUEUE_NAMES.map(unavailableQueueSummary);
}

async function canReachRedis(timeoutMs = 350) {
  const redisUrl = new URL(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");
  const host = redisUrl.hostname || "127.0.0.1";
  const port = Number(redisUrl.port || "6379");

  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

export async function getQueueSummaries(): Promise<QueueSummary[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return unavailableQueueSummaries();
  }

  if (!(await canReachRedis())) {
    return unavailableQueueSummaries();
  }

  return Promise.all(
    QUEUE_NAMES.map(async (name) => {
      const queue = getQueue(name);
      try {
        const [counts, isPaused, workers, waitingJobs, failedJobs] = await Promise.all([
          queue.getJobCounts("waiting", "active", "delayed", "completed", "failed", "paused"),
          queue.isPaused(),
          queue.getWorkers().catch(() => []),
          queue.getWaiting(0, 0),
          queue.getFailed(0, 49),
        ]);

        const completed = counts.completed ?? 0;
        const failed = counts.failed ?? 0;
        return {
          name,
          status: isPaused ? "paused" : "running",
          waiting: counts.waiting ?? 0,
          active: counts.active ?? 0,
          delayed: counts.delayed ?? 0,
          completed,
          failed,
          paused: counts.paused ?? 0,
          throughputPerMinute: Math.max(0, Math.round(completed / 60)),
          averageProcessingTimeMs: 0,
          oldestWaitingJob: waitingJobs[0]?.timestamp ? new Date(waitingJobs[0].timestamp).toISOString() : null,
          workers: workers.length,
          workerConcurrency: workers.length,
          failureRate: completed + failed > 0 ? Math.round((failed / (completed + failed)) * 100) : 0,
          retryCount: failedJobs.reduce((sum, job) => sum + job.attemptsMade, 0),
        };
      } catch {
        return unavailableQueueSummary(name);
      } finally {
        await queue.close().catch(() => undefined);
      }
    }),
  );
}

export function assertQueueName(value: string): asserts value is QueueName {
  if (!QUEUE_NAMES.includes(value as QueueName)) {
    throw new Error("Unknown queue");
  }
}
