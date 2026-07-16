import { getQueue } from "@/lib/queues/queue-service";

export const scheduledSyncQueue = getQueue("SCHEDULED_SYNC");
