export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center px-6"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
        />
        <p className="text-sm text-slate-600">Loading Grounded...</p>
      </div>
    </main>
  );
}
