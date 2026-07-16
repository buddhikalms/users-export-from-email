import { startGenericWorker } from "@/workers/generic-worker";

startGenericWorker({
  workerName: "omazync-export-worker",
  queueName: "EXCEL_EXPORT",
  concurrencyEnv: "EXPORT_WORKER_CONCURRENCY",
});
