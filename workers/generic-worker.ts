import { setTimeout as sleep } from "node:timers/promises";
import { Worker } from "bullmq";

import { db } from "@/lib/db";
import { getRedisConnection } from "@/lib/queues/connection";
import type { QueueName } from "@/lib/queues/queue-names";
import { attachWorkerHeartbeat } from "@/workers/heartbeat";

export function startGenericWorker(input: { workerName: string; queueName: QueueName; concurrencyEnv: string }) {
  const concurrency = Number(process.env[input.concurrencyEnv] ?? "2");
  const worker = new Worker(
    input.queueName,
    async (job) => {
      console.info(JSON.stringify({ event: "worker.job.received", worker: input.workerName, queue: input.queueName, jobId: job.id }));
      return { acknowledged: true, processedAt: new Date().toISOString() };
    },
    {
      connection: getRedisConnection(),
      concurrency,
    },
  );

  const stopHeartbeat = attachWorkerHeartbeat(worker, {
    workerName: input.workerName,
    queueName: input.queueName,
    concurrency,
  });

  async function shutdown(signal: string) {
    console.info(JSON.stringify({ event: "worker.shutdown", worker: input.workerName, signal }));
    stopHeartbeat();
    await worker.close();
    await db.$disconnect();
    await sleep(50);
    process.exit(0);
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
