import { db } from "@/lib/db";
import type { FolderPoint, GrowthPoint } from "@/components/charts/DashboardCharts";

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

export function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function getContactGrowthData(ownerId: string): Promise<GrowthPoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const contacts = await db.contact.findMany({
    where: { ownerId, createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 10_000,
  });

  if (contacts.length === 0) {
    return [];
  }

  const buckets = new Map<string, number>();

  for (const contact of contacts) {
    const label = monthFormatter.format(contact.createdAt);
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  let runningTotal = 0;
  return Array.from(buckets.entries()).map(([month, count]) => {
    runningTotal += count;
    return { month, contacts: runningTotal };
  });
}

export async function getFolderActivityData(ownerId: string): Promise<FolderPoint[]> {
  const folders = await db.contact.groupBy({
    by: ["sourceFolder"],
    where: {
      ownerId,
      sourceFolder: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { sourceFolder: "desc" } },
    take: 8,
  });

  return folders
    .filter((folder) => folder.sourceFolder)
    .map((folder) => ({
      name: folder.sourceFolder ?? "Unknown",
      value: folder._count._all,
    }));
}

export async function getTopDomainData(ownerId: string) {
  const domains = await db.contact.groupBy({
    by: ["domain"],
    where: {
      ownerId,
      domain: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { domain: "desc" } },
    take: 8,
  });

  return domains
    .filter((domain) => domain.domain)
    .map((domain) => ({
      domain: domain.domain ?? "Unknown",
      count: domain._count._all,
    }));
}
