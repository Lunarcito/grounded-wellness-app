import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-slate-500">404</p>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="text-sm text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <Link
          href="/login"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
}
