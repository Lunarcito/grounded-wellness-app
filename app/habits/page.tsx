import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { completeHabitForToday, createHabit } from "./actions";
import { SubmitButton } from "./submit-button";
import {
  calculateStreakForHabit,
  getDateDaysAgoUtc,
  getTodayDateUtc,
} from "./utils";

export default async function HabitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile || !profile.onboardingDone) {
    redirect("/setup");
  }

  const today = getTodayDateUtc();
  const thirtyDaysAgo = getDateDaysAgoUtc(29);

  const habits = await prisma.habit.findMany({
    where: {
      profileId: user.id,
      archivedAt: null,
      isActive: true,
    },
    include: {
      entries: {
        where: {
          completed: true,
          date: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        select: {
          date: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((habit) =>
    habit.entries.some((entry) => {
      const key = entry.date.toISOString().slice(0, 10);
      return key === today.toISOString().slice(0, 10);
    }),
  ).length;
  const completionPercentage =
    totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Habits</h1>
        <p className="text-sm text-neutral-600">
          Create small habits you want to track consistently.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Active habits</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {totalHabits}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Completed today</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {completedTodayCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Today</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {completionPercentage}%
          </p>
        </div>
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
            {habits.map((habit) => {
              const completedToday = habit.entries.some((entry) => {
                const key = entry.date.toISOString().slice(0, 10);
                return key === today.toISOString().slice(0, 10);
              });

              const streak = calculateStreakForHabit(
                habit.entries.map((entry) => entry.date),
              );

              return (
                <li
                  key={habit.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-900">{habit.name}</p>
                    <p className="text-sm text-neutral-500">
                      {streak > 0 ? `${streak}-day streak` : "No streak yet"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {completedToday ? "Completed today" : "Not completed yet"}
                    </p>
                  </div>

                  {completedToday ? (
                    <span className="inline-flex min-h-11 items-center rounded-xl bg-neutral-100 px-4 text-sm font-medium text-neutral-700">
                      Done
                    </span>
                  ) : (
                    <form action={completeHabitForToday}>
                      <input type="hidden" name="habitId" value={habit.id} />
                      <SubmitButton />
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
