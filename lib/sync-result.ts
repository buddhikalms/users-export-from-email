import type {
  CrossFolderDuplicate,
  EmailContact,
  FolderSyncResult,
  LastSeenFilter,
  SyncResult,
} from "@/types/email";

function isValidDate(value: string | undefined) {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function getStartOfDay(filterDate: string) {
  const date = new Date(filterDate);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getEndOfDay(filterDate: string) {
  const date = new Date(filterDate);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

function isAfterOrOn(contactDate: string, filterDate: string) {
  return new Date(contactDate).getTime() >= getStartOfDay(filterDate);
}

function isBeforeOrOn(contactDate: string, filterDate: string) {
  return new Date(contactDate).getTime() <= getEndOfDay(filterDate);
}

function contactMatchesLastSeenFilter(
  contact: EmailContact,
  filter: LastSeenFilter,
) {
  if (filter.mode === "all" || !filter.date || !isValidDate(filter.date)) {
    return true;
  }

  const filterDate = filter.date;

  if (filter.mode === "after") {
    return isAfterOrOn(contact.lastSeen, filterDate);
  }

  return isBeforeOrOn(contact.lastSeen, filterDate);
}

function buildDuplicates(folders: FolderSyncResult[]): CrossFolderDuplicate[] {
  const aggregate = new Map<
    string,
    {
      name: string;
      folders: Set<string>;
      totalEmailCount: number;
    }
  >();

  for (const folder of folders) {
    for (const contact of folder.contacts) {
      const existing = aggregate.get(contact.email);

      if (!existing) {
        aggregate.set(contact.email, {
          name: contact.name,
          folders: new Set([folder.displayName]),
          totalEmailCount: contact.emailCount,
        });
        continue;
      }

      existing.folders.add(folder.displayName);
      existing.totalEmailCount += contact.emailCount;
      if (!existing.name || existing.name === contact.email.split("@")[0]) {
        existing.name = contact.name;
      }
    }
  }

  return Array.from(aggregate.entries())
    .filter(([, value]) => value.folders.size > 1)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([email, value]) => ({
      email,
      name: value.name,
      folders: Array.from(value.folders).sort(),
      totalEmailCount: value.totalEmailCount,
    }));
}

export function filterSyncResultByLastSeen(
  syncResult: SyncResult,
  filter: LastSeenFilter,
): SyncResult {
  if (filter.mode !== "all" && !isValidDate(filter.date)) {
    return syncResult;
  }

  const folders = syncResult.folders.map((folder) => ({
    ...folder,
    contacts: folder.contacts.filter((contact) =>
      contactMatchesLastSeenFilter(contact, filter),
    ),
  }));

  const allContacts = syncResult.allContacts.filter((contact) =>
    contactMatchesLastSeenFilter(contact, filter),
  );

  return {
    folders,
    allContacts,
    duplicatesAcrossFolders: buildDuplicates(folders),
  };
}
