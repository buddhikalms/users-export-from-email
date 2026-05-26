"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Table } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { LastSeenFilter, SyncResult } from "@/types/email";

export function ExportButton({
  syncResult,
  filter,
}: {
  syncResult: SyncResult;
  filter: LastSeenFilter;
}) {
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  async function exportFile(format: "excel" | "csv" | "json") {
    if (filter.mode !== "all" && !filter.date) {
      setStatus({
        type: "error",
        message: "Select a last seen date before exporting with a before/after filter.",
      });
      return;
    }

    setExporting(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncResult,
          filter,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? `${format.toUpperCase()} export failed.`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("Content-Disposition");
      const fileNameMatch = disposition?.match(/filename="(.+)"/);
      anchor.href = url;
      anchor.download = fileNameMatch?.[1] ?? `buddhi-email-contacts.${format === "excel" ? "xlsx" : format}`;
      anchor.click();
      window.URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        message: `${format.toUpperCase()} export created successfully. Your download should begin immediately.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `Something went wrong while exporting the ${format.toUpperCase()} file.`,
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          className="sm:min-w-48"
          disabled={exporting || (filter.mode !== "all" && !filter.date)}
          onClick={() => void exportFile("excel")}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {exporting ? "Exporting..." : "Excel"}
        </Button>
        <Button
          className="sm:min-w-36"
          disabled={exporting || (filter.mode !== "all" && !filter.date)}
          variant="outline"
          onClick={() => void exportFile("csv")}
        >
          <Table className="h-4 w-4" />
          CSV
        </Button>
        <Button
          className="sm:min-w-36"
          disabled={exporting || (filter.mode !== "all" && !filter.date)}
          variant="outline"
          onClick={() => void exportFile("json")}
        >
          <FileJson className="h-4 w-4" />
          JSON
        </Button>
        <Button disabled variant="ghost">
          <Download className="h-4 w-4" />
          Queue large export
        </Button>
      </div>

      {status ? (
        <Alert
          className={
            status.type === "error"
              ? "border-destructive/25 bg-destructive/5"
              : "border-primary/20 bg-primary/5"
          }
        >
          <AlertTitle>
            {status.type === "error" ? "Export failed" : "Export ready"}
          </AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
