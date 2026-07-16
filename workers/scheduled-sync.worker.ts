import { startGenericWorker } from "@/workers/generic-worker";

startGenericWorker({
  workerName: "omazync-scheduler",
  queueName: "SCHEDULED_SYNC",
  concurrencyEnv: "SCHEDULED_SYNC_WORKER_CONCURRENCY",
});
