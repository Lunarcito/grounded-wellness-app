import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { StatCard } from "../../../components/ui/stat-card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ProgressMetric } from "../../../components/ui/progress-metric";
import { formatCheckInLabel } from "./formatters";

type WeeklyHabitData = {
  label: string;
  completed: number;
};

type HabitEntryForStreak = {
  completed: boolean;
  date: Date;
};

function WeeklyHabitGrid({ data }: { data: WeeklyHabitData[] }) {
  return (
    <div className="mt-6">
      <div className="mx-auto grid max-w-xl grid-cols-7 gap-1.5">
        {data.map((day) => (
          <div key={day.label} className="min-w-0 text-center">
            <p className="mb-2 text-xs font-medium text-gray-500">
              {day.label}
            </p>
            <div
              className={`mx-auto flex size-14 items-center justify-center rounded-xl border text-sm font-semibold transition-colors sm:size-16 ${
                day.completed > 0
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
              aria-label={`${day.completed} completed habits on ${day.label}`}
            >
              {day.completed}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFocusAreas(value: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      item
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );
}

function getDateKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function getCurrentStreak(entries: HabitEntryForStreak[], today: Date) {
  const completedDates = new Set(
    entries
      .filter((entry) => entry.completed)
      .map((entry) => getDateKey(entry.date)),
  );

  const todayKey = getDateKey(today);
  const streakStart = new Date(today);
  const completedToday = completedDates.has(todayKey);

  if (!completedToday) {
    streakStart.setDate(streakStart.getDate() - 1);
  }

  let streak = 0;

  while (completedDates.has(getDateKey(streakStart))) {
    streak += 1;
    streakStart.setDate(streakStart.getDate() - 1);
  }

  return { completedToday, streak };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile || !profile.onboardingDone) redirect("/setup");

  const latestCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { profileId: user.id },
    orderBy: { date: "desc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysSinceMonday);

  const [weeklyCheckIns, habitEntries] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: {
        profileId: user.id,
        date: { gte: weekStart },
      },
      orderBy: { date: "asc" },
    }),
    prisma.habitEntry.findMany({
      where: {
        profileId: user.id,
        date: { lte: today },
      },
      select: { completed: true, date: true },
    }),
  ]);

  const weeklyHabitEntries = habitEntries.filter(
    (entry) => entry.date >= weekStart,
  );

  const completedHabits = weeklyHabitEntries.filter(
    (entry) => entry.completed,
  ).length;
  const trackedHabits = weeklyHabitEntries.length;
  const completionRate =
    trackedHabits > 0 ? Math.round((completedHabits / trackedHabits) * 100) : 0;
  const averageMood =
    weeklyCheckIns.length > 0
      ? Math.round(
          (weeklyCheckIns.reduce(
            (total, checkIn) => total + checkIn.moodScore,
            0,
          ) /
            weeklyCheckIns.length) *
            10,
        ) / 10
      : null;

  const weeklyHabitData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dayKey = getDateKey(date);

    const completed = weeklyHabitEntries.filter(
      (entry) => entry.completed && getDateKey(entry.date) === dayKey,
    ).length;

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed,
    };
  });

  const { streak: currentStreak, completedToday } = getCurrentStreak(
    habitEntries,
    today,
  );
  const totalWeeklyCompleted = weeklyHabitData.reduce(
    (total, day) => total + day.completed,
    0,
  );
  const activeHabitDays = weeklyHabitData.filter(
    (day) => day.completed > 0,
  ).length;
  const focusAreas = formatFocusAreas(profile.focusAreas);
  const firstName =
    profile.displayName?.trim().split(" ")[0] || user.email.split("@")[0];
  const currentStreakDescription =
    currentStreak === 0
      ? "Complete a habit to begin"
      : completedToday
        ? "Keep building your routine"
        : "Complete a habit today to keep it going";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Wellness dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Your setup is complete and your personal wellness space is ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            Setup completed
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/check-in"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            New daily check-in
          </Link>
          <Link
            href="/habits"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Manage habits
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">This week</h2>
          <p className="mt-1 text-sm text-gray-600">
            A quick overview of your recent wellness activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Check-ins logged" value={weeklyCheckIns.length} />
          <StatCard
            label="Habit completion"
            value={trackedHabits > 0 ? `${completionRate}%` : "No data"}
            description={
              trackedHabits > 0
                ? `${completedHabits} of ${trackedHabits} tracked entries`
                : undefined
            }
          />
          <StatCard
            label="Current streak"
            value={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
            description={currentStreakDescription}
          />
          <StatCard
            label="Average mood"
            value={averageMood ?? "No data"}
            description={averageMood != null ? "out of 5" : undefined}
          />
        </div>
      </section>

      <section
        aria-labelledby="habit-consistency-title"
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="habit-consistency-title"
              className="text-xl font-semibold text-gray-900"
            >
              Habit consistency
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Your completed habits over the last 7 days.
            </p>
          </div>

          <div className="flex gap-5 sm:justify-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Completed
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {totalWeeklyCompleted}
              </p>
              <p className="text-xs text-gray-500">entries this week</p>
            </div>

            <div className="border-l border-gray-200 pl-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Active days
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {activeHabitDays}
                <span className="text-sm font-normal text-gray-500"> / 7</span>
              </p>
              <p className="text-xs text-gray-500">days completed</p>
            </div>
          </div>
        </div>

        <WeeklyHabitGrid data={weeklyHabitData} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Focus areas</h2>
          {focusAreas.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
                >
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No focus areas yet"
              description="Your selected focus areas will appear here."
            />
          )}
        </article>

        <article
          data-testid="today-summary"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900">Today</h2>
          {latestCheckIn ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Mood
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {formatCheckInLabel(latestCheckIn.moodScore)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Energy
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {formatCheckInLabel(latestCheckIn.energyScore)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Sleep
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {formatCheckInLabel(latestCheckIn.sleepQualityScore)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Stress
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {latestCheckIn.stressScore != null
                      ? formatCheckInLabel(latestCheckIn.stressScore)
                      : "Not logged"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ProgressMetric
                  label="Water"
                  value={latestCheckIn.waterMl}
                  goal={profile.waterGoalMl}
                  unit="ml"
                />
                <ProgressMetric
                  label="Movement"
                  value={latestCheckIn.movementMin}
                  goal={profile.movementGoalMin}
                  unit="min"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Your next step
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Keep your momentum by completing today&apos;s habits.
                </p>
                <Link
                  href="/habits"
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  View today&apos;s habits
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No check-in yet"
              description="Add your first daily check-in to begin tracking how you feel."
              action={
                <Link
                  href="/check-in"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  New daily check-in
                </Link>
              }
            />
          )}
        </article>
      </section>
    </main>
  );
}
