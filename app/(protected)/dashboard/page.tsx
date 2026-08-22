import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { StatCard } from "../../../components/ui/stat-card";
import { formatCheckInLabel } from "./formatters";
import { WeeklyHabitChart } from "./weekly-habit-chart";
import { EmptyState } from "../../../components/ui/empty-state";

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

function formatGoal(value: string | null) {
  if (!value) return "Not set yet";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function DashboardPage() {
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

  const latestCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { profileId: user.id },
    orderBy: { date: "desc" },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [weeklyCheckIns, weeklyHabitEntries] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: {
        profileId: user.id,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.habitEntry.findMany({
      where: {
        profileId: user.id,
        date: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        completed: true,
        date: true,
      },
    }),
  ]);

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
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + index);

    const dayKey = date.toISOString().slice(0, 10);
    const completed = weeklyHabitEntries.filter(
      (entry) =>
        entry.completed && entry.date.toISOString().slice(0, 10) === dayKey,
    ).length;

    return {
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      completed,
    };
  });

  const focusAreas = formatFocusAreas(profile.focusAreas);
  const firstName =
    profile.displayName?.trim().split(" ")[0] || user.email.split("@")[0];

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
          <a
            href="/check-in"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            New daily check-in
          </a>
          <a
            href="/habits"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Manage habits
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Water goal" value={`${profile.waterGoalMl} ml`} />
        <StatCard
          label="Movement goal"
          value={`${profile.movementGoalMin} min`}
        />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Last 7 days</h2>
          <p className="mt-1 text-sm text-gray-600">
            A quick overview of your recent wellness activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
            label="Average mood"
            value={averageMood ?? "No data"}
            description={averageMood != null ? "out of 5" : undefined}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Habit activity
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Your completed habits over the last 7 days.
          </p>
        </div>

        <WeeklyHabitChart data={weeklyHabitData} />
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

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    Water:{" "}
                    <span className="font-medium text-gray-900">
                      {latestCheckIn.waterMl ?? 0} ml
                    </span>
                  </span>
                  <span>
                    Movement:{" "}
                    <span className="font-medium text-gray-900">
                      {latestCheckIn.movementMin ?? 0} min
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <EmptyState
                title="No check-in yet"
                description="Add your first daily check-in to begin tracking how you feel."
                action={
                  <a
                    href="/check-in"
                    className="inline-flex min-h-11 items-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Start check-in
                  </a>
                }
              />
            </>
          )}
        </article>
      </section>
    </main>
  );
}
