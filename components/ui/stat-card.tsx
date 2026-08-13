type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {description && (
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      )}
    </article>
  );
}
