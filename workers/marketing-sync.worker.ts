import { startGenericWorker } from "@/workers/generic-worker";

startGenericWorker({
  workerName: "omazync-marketing-worker",
  queueName: "KIT_SYNC",
  concurrencyEnv: "MARKETING_SYNC_WORKER_CONCURRENCY",
});
