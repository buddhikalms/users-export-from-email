import { getQueue } from "@/lib/queues/queue-service";

export const emailSyncQueue = getQueue("EMAIL_SYNC");
