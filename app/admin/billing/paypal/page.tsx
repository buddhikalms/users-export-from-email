import { CreditCard } from "lucide-react";

import { PayPalSyncPanel } from "@/components/admin/PayPalSyncPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPayPalSyncStatus } from "@/lib/paypal/sync";

export const dynamic = "force-dynamic";

export default async function AdminPayPalBillingPage() {
  const status = await getPayPalSyncStatus();

  return (
    <main className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CreditCard className="h-4 w-4" />
          PayPal Billing
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Product & Plan Sync</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Synchronize active OMAZYNC subscription packages with PayPal products and subscription plans for the current environment.
        </p>
      </div>

      <Alert>
        <AlertTitle>Environment-aware synchronization</AlertTitle>
        <AlertDescription>
          Sandbox and live PayPal IDs are stored separately. The client secret is used only on the server and is never returned to this page.
        </AlertDescription>
      </Alert>

      <PayPalSyncPanel initialStatus={{ success: true, ...status }} />
    </main>
  );
}
