/** Shared "no data yet" panel — kept visually distinct from ErrorState on purpose. */
export default function EmptyState({ icon: Icon, title, message, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 py-16 text-center ${className}`}>
      {Icon && <Icon size={22} className="mb-1 text-muted-foreground" />}
      <p className="text-sm font-medium">{title}</p>
      {message && <p className="max-w-sm text-xs text-muted-foreground">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
