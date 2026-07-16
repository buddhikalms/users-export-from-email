"use client";

import { Play, RotateCcw, Trash2, Pause } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type QueueActionPanelProps = {
  queueName: string;
};

async function postQueueAction(queueName: string, action: string) {
  const response = await fetch(`/api/admin/queues/${encodeURIComponent(queueName)}/${action}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Queue action failed");
  }
}

export function QueueActionPanel({ queueName }: QueueActionPanelProps) {
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, dangerous = false) {
    if (dangerous && !window.confirm(`Confirm ${action} for ${queueName}. This can affect running operations.`)) {
      return;
    }
    setBusy(action);
    try {
      await postQueueAction(queueName, action);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={Boolean(busy)} onClick={() => run("pause")} size="sm" variant="outline">
        <Pause className="h-3.5 w-3.5" />
        Pause
      </Button>
      <Button disabled={Boolean(busy)} onClick={() => run("resume")} size="sm" variant="outline">
        <Play className="h-3.5 w-3.5" />
        Resume
      </Button>
      <Button disabled={Boolean(busy)} onClick={() => run("retry")} size="sm" variant="outline">
        <RotateCcw className="h-3.5 w-3.5" />
        Retry failed
      </Button>
      <Button disabled={Boolean(busy)} onClick={() => run("clean", true)} size="sm" variant="outline">
        <Trash2 className="h-3.5 w-3.5" />
        Clean
      </Button>
    </div>
  );
}
