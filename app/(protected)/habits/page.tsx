import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { StatCard } from "../../../components/ui/stat-card";
import { createHabit } from "./actions";
import { SubmitButton } from "../../../components/ui/submit-button";
import { HabitCard } from "./habit-card";
import {
  calculateStreakForHabit,
  getDateDaysAgoUtc,
  getTodayDateUtc,
} from "./utils";
import { EmptyState } from "../../../components/ui/empty-state";
import { getTodayInTimezone } from "@/lib/dates";

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

  const timezone = profile.timezone || "Europe/Madrid";
  const todayKey = getTodayInTimezone(timezone);
  const today = getTodayDateUtc(new Date(), timezone);
  const thirtyDaysAgo = getDateDaysAgoUtc(29, new Date(), timezone);

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
        select: { date: true },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((habit) =>
    habit.entries.some(
      (entry) =>
        new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
        }).format(entry.date) === todayKey,
    ),
  ).length;
  const completionPercentage =
    totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Habits</h1>
        <p className="text-sm text-neutral-600">
          Create small habits you want to track consistently.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Active habits" value={totalHabits} />
        <StatCard label="Completed today" value={completedTodayCount} />
        <StatCard label="Today" value={`${completionPercentage}%`} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form action={createHabit} className="flex flex-col gap-4 sm:flex-row">
          <label htmlFor="habit-name" className="sr-only">
            Habit name
          </label>
          <input
            id="habit-name"
            type="text"
            name="name"
            placeholder="e.g. Morning walk"
            required
            className="min-h-11 flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <SubmitButton label="Add habit" pendingLabel="Adding..." />
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your habits</h2>

        {habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            description="Add your first habit above to start tracking your progress."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayKey={todayKey}
                today={today}
                timezone={timezone}
                streak={calculateStreakForHabit(
                  habit.entries.map((entry) => entry.date),
                  new Date(),
                  timezone,
                )}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
