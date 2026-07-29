import { createHabit } from "./actions";
import { prisma } from "@/lib/prisma";

export default async function HabitsPage() {
  const habits = await prisma.habit.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Habits</h1>
        <p className="text-sm text-neutral-600">
          Create small habits you want to track consistently.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form action={createHabit} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            name="name"
            placeholder="e.g. Morning walk"
            className="min-h-11 flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add habit
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your habits</h2>

        {habits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
            No habits yet. Add your first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {habits.map((habit) => (
              <li
                key={habit.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <p className="font-medium text-neutral-900">{habit.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
