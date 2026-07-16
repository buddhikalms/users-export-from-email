import { getQueue } from "@/lib/queues/queue-service";

export const kitSyncQueue = getQueue("KIT_SYNC");
export const mailchimpSyncQueue = getQueue("MAILCHIMP_SYNC");
export const brevoSyncQueue = getQueue("BREVO_SYNC");
export const hubspotSyncQueue = getQueue("HUBSPOT_SYNC");
export const beehiivSyncQueue = getQueue("BEEHIIV_SYNC");
export const activeCampaignSyncQueue = getQueue("ACTIVECAMPAIGN_SYNC");
