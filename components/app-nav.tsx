import Link from "next/link";
import { signOut } from "../app/actions";

export function AppNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
          Grounded
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-2"
        >
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/check-in"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Check-in
          </Link>

          <Link
            href="/habits"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Habits
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
