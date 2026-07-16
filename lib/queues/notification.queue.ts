import { getQueue } from "@/lib/queues/queue-service";

export const notificationQueue = getQueue("NOTIFICATIONS");
