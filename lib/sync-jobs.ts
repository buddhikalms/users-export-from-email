import { getEmailSyncQueue } from "@/lib/queue";

export type EmailSyncJobData = {
  syncRunId: string;
  userId: string;
  savedAccountId: string;
  folders: string[];
  extractForwardedChains: boolean;
  dateRange?: {
    since?: string;
    before?: string;
  };
};

export type PublicSyncStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export async function enqueueEmailSyncJob(data: EmailSyncJobData) {
  const queue = getEmailSyncQueue();

  return queue.add("sync-folders", data, {
    jobId: data.syncRunId,
  });
}

export async function getEmailSyncJob(jobId: string) {
  return getEmailSyncQueue().getJob(jobId);
}

export function toPublicSyncStatus(status: string): PublicSyncStatus {
  switch (status) {
    case "RUNNING":
      return "running";
    case "SUCCESS":
    case "PARTIAL":
      return "completed";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    case "QUEUED":
    default:
      return "queued";
  }
}
