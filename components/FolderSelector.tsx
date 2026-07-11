"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, FolderOpen, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { saveSelectedFolders, saveSyncDateRange } from "@/lib/storage";
import { getActiveVaultConnection } from "@/lib/vault-session";
import type { ActiveConnection, MailFolder } from "@/types/email";

interface FolderSelectorProps {
  connection: ActiveConnection;
  initialSelection?: string[];
}

type FolderTreeNode = {
  id: string;
  name: string;
  path: string;
  folder?: MailFolder;
  children: FolderTreeNode[];
};

function getFolderParts(folder: MailFolder) {
  const delimiter = folder.delimiter || (folder.path.includes("/") ? "/" : ".");
  const parts = folder.path.split(delimiter).filter(Boolean);
  return parts.length > 0 ? parts : [folder.name || folder.path];
}

function buildFolderTree(folders: MailFolder[]) {
  const root: FolderTreeNode = { id: "root", name: "root", path: "", children: [] };
  const nodeMap = new Map<string, FolderTreeNode>([["", root]]);

  for (const folder of folders) {
    const parts = getFolderParts(folder);
    let currentPath = "";
    let parent = root;

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let node = nodeMap.get(currentPath);

      if (!node) {
        node = {
          id: currentPath,
          name: part,
          path: currentPath,
          children: [],
        };
        nodeMap.set(currentPath, node);
        parent.children.push(node);
      }

      parent = node;
    }

    parent.folder = folder;
    parent.name = folder.name || parent.name;
    parent.path = folder.path;
  }

  const sortNodes = (nodes: FolderTreeNode[]) => {
    nodes.sort((left, right) => {
      if (left.folder?.specialUse === "\\Inbox") return -1;
      if (right.folder?.specialUse === "\\Inbox") return 1;
      return left.name.localeCompare(right.name);
    });
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(root.children);
  return root.children;
}

export function FolderSelector({
  connection,
  initialSelection = [],
}: FolderSelectorProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<MailFolder[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [since, setSince] = useState("");
  const [before, setBefore] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFolders() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/imap/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          connection.mode === "manual"
            ? { settings: getActiveVaultConnection() }
            : connection.mode === "vault"
              ? { settings: getActiveVaultConnection() }
              : { savedAccountId: connection.account.id },
        ),
      });

      const payload = (await response.json()) as
        | { folders?: MailFolder[]; error?: string }
        | undefined;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to fetch mail folders.");
      }

      const nextFolders = payload?.folders ?? [];
      setFolders(nextFolders);
      setExpanded(
        new Set(
          nextFolders
            .map((folder) => getFolderParts(folder)[0])
            .filter((part): part is string => Boolean(part)),
        ),
      );

      setSelected((current) => {
        if (current.length > 0) {
          return current;
        }

        const inbox = nextFolders.find((folder) => folder.specialUse === "\\Inbox");
        return inbox ? [inbox.path] : nextFolders.slice(0, 1).map((folder) => folder.path);
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong while loading folders.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFolders();
  }, []);

  const selectedCount = selected.length;
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);
  const folderCountLabel = useMemo(() => {
    if (folders.length === 0) {
      return "No folders loaded";
    }

    return `${selectedCount} of ${folders.length} selected`;
  }, [folders.length, selectedCount]);

  function toggleExpanded(path: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function toggleFolderBranch(node: FolderTreeNode, checked: boolean) {
    const paths = collectFolderPaths(node);
    setSelected((current) => {
      const next = new Set(current);
      for (const path of paths) {
        if (checked) {
          next.add(path);
        } else {
          next.delete(path);
        }
      }
      return Array.from(next);
    });
  }

  function collectFolderPaths(node: FolderTreeNode): string[] {
    return [
      ...(node.folder ? [node.folder.path] : []),
      ...node.children.flatMap((child) => collectFolderPaths(child)),
    ];
  }

  function renderTree(nodes: FolderTreeNode[], depth = 0) {
    return nodes.map((node) => {
      const folderPaths = collectFolderPaths(node);
      const checkedCount = folderPaths.filter((path) => selected.includes(path)).length;
      const checked = folderPaths.length > 0 && checkedCount === folderPaths.length;
      const hasChildren = node.children.length > 0;
      const isExpanded = expanded.has(node.path);

      return (
        <div key={node.id} className="space-y-2">
          <div
            className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 dark:bg-card/80 p-3 transition hover:border-primary/25"
            style={{ marginLeft: depth ? `${Math.min(depth * 18, 72)}px` : undefined }}
          >
            <button
              type="button"
              className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
              onClick={() => hasChildren && toggleExpanded(node.path)}
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </button>
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => toggleFolderBranch(node, Boolean(value))}
            />
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => hasChildren && toggleExpanded(node.path)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">{node.name}</span>
                {node.folder?.specialUse ? (
                  <Badge className="bg-primary/10">{node.folder.specialUse}</Badge>
                ) : null}
                {folderPaths.length > 1 ? (
                  <Badge className="bg-secondary text-secondary-foreground">
                    {checkedCount}/{folderPaths.length}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {node.folder?.path ?? `${folderPaths.length} folders`}
              </p>
            </button>
          </div>
          {hasChildren && isExpanded ? renderTree(node.children, depth + 1) : null}
        </div>
      );
    });
  }

  function continueToSync() {
    if (selected.length === 0) {
      setError("Select at least one mail folder before syncing.");
      return;
    }

    setSubmitting(true);
    saveSelectedFolders(selected);
    saveSyncDateRange({
      since: since || undefined,
      before: before || undefined,
    });
    router.push("/results");
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Select Folders To Sync</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose the mail folders whose message headers should be scanned for
            unique contacts.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
            {connection.mode === "manual"
              ? `Manual session: ${connection.account.email}`
              : connection.mode === "vault"
                ? `Vault account: ${connection.account.name} (${connection.account.email})`
              : `Saved account: ${connection.account.label} (${connection.account.email})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge>{folderCountLabel}</Badge>
          <Button size="sm" type="button" variant="outline" onClick={() => void loadFolders()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <Alert className="border-destructive/25 bg-destructive/5">
            <AlertTitle>Folder loading issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => setSelected(folders.map((folder) => folder.path))}
          >
            Select All
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border/70 bg-white/70 dark:bg-card/75 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="sync-since">
              Scan messages from
            </label>
            <Input
              id="sync-since"
              type="date"
              value={since}
              onChange={(event) => setSince(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="sync-before">
              Scan messages before
            </label>
            <Input
              id="sync-before"
              type="date"
              value={before}
              onChange={(event) => setBefore(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!since && !before}
            onClick={() => {
              setSince("");
              setBefore("");
            }}
          >
            Clear Dates
          </Button>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-8 text-center text-sm text-muted-foreground">
              Loading mail folders...
            </div>
          ) : folders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-8 text-center text-sm text-muted-foreground">
              No mail folders were returned for this account.
            </div>
          ) : (
            renderTree(folderTree)
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={loading || submitting} onClick={continueToSync}>
            {submitting ? "Opening sync..." : "Sync Selected Folders"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
            Back To Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
