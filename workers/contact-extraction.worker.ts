import { startGenericWorker } from "@/workers/generic-worker";

startGenericWorker({
  workerName: "omazync-contact-worker",
  queueName: "CONTACT_EXTRACTION",
  concurrencyEnv: "CONTACT_EXTRACTION_WORKER_CONCURRENCY",
});
