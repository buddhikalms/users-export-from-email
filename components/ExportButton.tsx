"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Table,
} from "lucide-react";

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
    href?: string;
  } | null>(null);
  const [exportingFormat, setExportingFormat] = useState<
    "excel" | "csv" | "json" | "google-sheets" | null
  >(null);

  async function exportFile(format: "excel" | "csv" | "json") {
    if (filter.mode !== "all" && !filter.date) {
      setStatus({
        type: "error",
        message: "Select a last seen date before exporting with a before/after filter.",
      });
      return;
    }

    setExportingFormat(format);
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
      setExportingFormat(null);
    }
  }

  async function exportGoogleSheet() {
    if (filter.mode !== "all" && !filter.date) {
      setStatus({
        type: "error",
        message: "Select a last seen date before exporting with a before/after filter.",
      });
      return;
    }

    setExportingFormat("google-sheets");
    setStatus(null);

    try {
      const response = await fetch("/api/export/google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncResult,
          filter,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        spreadsheet?: {
          spreadsheetUrl: string;
          sharedWithEmail?: string;
        };
        summary?: {
          contacts: number;
          sheets: number;
        };
      };

      if (!response.ok || !payload.spreadsheet) {
        throw new Error(payload.error ?? "Google Sheets export failed.");
      }

      const sharedText = payload.spreadsheet.sharedWithEmail
        ? ` Shared with ${payload.spreadsheet.sharedWithEmail}.`
        : "";
      const summaryText = payload.summary
        ? `${payload.summary.contacts} contacts exported across ${payload.summary.sheets} sheets.`
        : "Google Sheet created successfully.";

      setStatus({
        type: "success",
        message: `${summaryText}${sharedText}`,
        href: payload.spreadsheet.spreadsheetUrl,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the Google Sheet.",
      });
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          className="sm:min-w-48"
          disabled={exportingFormat !== null || (filter.mode !== "all" && !filter.date)}
          onClick={() => void exportGoogleSheet()}
        >
          <ExternalLink className="h-4 w-4" />
          {exportingFormat === "google-sheets" ? "Creating..." : "Google Sheet"}
        </Button>
        <Button
          className="sm:min-w-48"
          disabled={exportingFormat !== null || (filter.mode !== "all" && !filter.date)}
          variant="outline"
          onClick={() => void exportFile("excel")}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {exportingFormat === "excel" ? "Exporting..." : "Excel"}
        </Button>
        <Button
          className="sm:min-w-36"
          disabled={exportingFormat !== null || (filter.mode !== "all" && !filter.date)}
          variant="outline"
          onClick={() => void exportFile("csv")}
        >
          <Table className="h-4 w-4" />
          CSV
        </Button>
        <Button
          className="sm:min-w-36"
          disabled={exportingFormat !== null || (filter.mode !== "all" && !filter.date)}
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
          <AlertDescription>
            <span>{status.message}</span>
            {status.href ? (
              <a
                className="ml-2 inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                href={status.href}
                rel="noreferrer"
                target="_blank"
              >
                Open Sheet
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
