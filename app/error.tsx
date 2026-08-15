"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section
        role="alert"
        className="flex max-w-md flex-col items-center gap-4 text-center"
      >
        <p className="text-sm font-medium text-red-600">Something went wrong</p>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          We couldn&apos;t load this page
        </h1>

        <p className="text-sm text-slate-600">
          Please try again. If the problem continues, come back later.
        </p>

        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
