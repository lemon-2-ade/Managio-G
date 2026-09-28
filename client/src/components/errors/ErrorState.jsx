import { WifiOff, ShieldAlert, ServerCrash, Clock, TriangleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeError } from "@/lib/errors";

const ICONS = {
  network: WifiOff,
  auth: ShieldAlert,
  permission: ShieldAlert,
  server: ServerCrash,
  rate_limit: Clock,
  not_found: TriangleAlert,
  validation: TriangleAlert,
  unknown: TriangleAlert,
};

/**
 * Inline panel for when loading a page/section's data failed. Distinct from
 * EmptyState (no error, just no data) so failures are never mistaken for "nothing here."
 */
export default function ErrorState({ error, onRetry, className = "" }) {
  const { type, title, message, retryable } = normalizeError(error);
  const Icon = ICONS[type] || TriangleAlert;

  return (
    <div className={`flex flex-col items-center gap-2 py-16 text-center ${className}`}>
      <Icon size={22} className="mb-1 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
      {retryable && onRetry && (
        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={onRetry}>
          <RotateCw size={13} /> Try again
        </Button>
      )}
    </div>
  );
}
