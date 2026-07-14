import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { OmaAssistantWorkspace } from "@/components/assistant/OmaAssistantWorkspace";

export const metadata = {
  title: "OM - Assist - OMAZYNC",
  description: "Use OM - Assist to plan safe email syncs, exports, automations, reports, and troubleshooting workflows.",
};

export default async function AssistantPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <OmaAssistantWorkspace />;
}
