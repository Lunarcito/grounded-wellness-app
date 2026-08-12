export default function ProtectedLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-neutral-200" />

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-neutral-100"
          />
        ))}
      </div>

      <div className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
    </main>
  );
}
