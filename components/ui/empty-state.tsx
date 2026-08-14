type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
      <p className="font-medium text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
