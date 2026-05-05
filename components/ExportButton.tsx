"use client";

import { useState } from "react";
import { Download } from "lucide-react";

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

  async function exportWorkbook() {
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
      const response = await fetch("/api/export/excel", {
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
        throw new Error(payload.error ?? "Excel export failed.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("Content-Disposition");
      const fileNameMatch = disposition?.match(/filename="(.+)"/);
      anchor.href = url;
      anchor.download = fileNameMatch?.[1] ?? "outlook-contacts.xlsx";
      anchor.click();
      window.URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        message: "Workbook created successfully. Your download should begin immediately.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while exporting the workbook.",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        className="sm:min-w-56"
        disabled={exporting || (filter.mode !== "all" && !filter.date)}
        onClick={exportWorkbook}
      >
        <Download className="h-4 w-4" />
        {exporting ? "Generating workbook..." : "Export Excel Workbook"}
      </Button>

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
