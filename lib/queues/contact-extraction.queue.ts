import { getQueue } from "@/lib/queues/queue-service";

export const contactExtractionQueue = getQueue("CONTACT_EXTRACTION");
