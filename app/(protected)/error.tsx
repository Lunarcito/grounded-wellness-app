"use client";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-6 py-10">
      <section className="w-full rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Please try again. If the problem continues, come back later.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 min-h-11 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
