import os from "node:os";
import type { Worker } from "bullmq";

import { db } from "@/lib/db";

export function attachWorkerHeartbeat(worker: Worker, input: { workerName: string; queueName: string; concurrency: number }) {
  const interval = setInterval(async () => {
    const memoryMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
    await db.workerHeartbeat
      .upsert({
        where: {
          workerName_queueName: {
            workerName: input.workerName,
            queueName: input.queueName,
          },
        },
        update: {
          state: worker.closing ? "stopping" : "online",
          lastHeartbeatAt: new Date(),
          memoryMb,
          uptimeSeconds: Math.round(process.uptime()),
          concurrency: input.concurrency,
          hostname: os.hostname(),
          appVersion: process.env.npm_package_version ?? "1.0.0",
        },
        create: {
          workerName: input.workerName,
          queueName: input.queueName,
          state: "online",
          memoryMb,
          uptimeSeconds: Math.round(process.uptime()),
          concurrency: input.concurrency,
          hostname: os.hostname(),
          appVersion: process.env.npm_package_version ?? "1.0.0",
        },
      })
      .catch((error) => {
        console.error("worker_heartbeat_failed", error);
      });
  }, Number(process.env.WORKER_HEARTBEAT_MS ?? "30000"));

  worker.on("completed", async () => {
    await db.workerHeartbeat
      .updateMany({
        where: { workerName: input.workerName, queueName: input.queueName },
        data: { completedJobs: { increment: 1 }, lastHeartbeatAt: new Date() },
      })
      .catch(() => undefined);
  });

  worker.on("failed", async (_job, error) => {
    await db.workerHeartbeat
      .updateMany({
        where: { workerName: input.workerName, queueName: input.queueName },
        data: { failedJobs: { increment: 1 }, lastError: error.message.slice(0, 8000), lastHeartbeatAt: new Date() },
      })
      .catch(() => undefined);
  });

  return () => clearInterval(interval);
}
