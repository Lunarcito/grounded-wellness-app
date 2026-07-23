import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

function formatCheckInLabel(value: number | null | undefined) {
  if (value == null) return "Not logged";

  const labels: Record<number, string> = {
    1: "Very low",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Great",
  };

  return labels[value] ?? String(value);
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

  if (!profile) {
    redirect("/setup");
  }

  if (!profile.onboardingDone) {
    redirect("/setup");
  }

  const latestCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { profileId: user.id },
    orderBy: { date: "desc" },
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
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {profile.timezone}
          </span>
        </div>

        <div className="mt-6">
          <Link
            href="/check-in"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            New daily check-in
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Water goal</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {profile.waterGoalMl} ml
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Movement goal</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {profile.movementGoalMin} min
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Main goal</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {formatGoal(profile.wellnessGoal)}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Profile</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {profile.displayName || "No display name"}
          </p>
          <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
        </article>
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
            <p className="mt-3 text-sm text-gray-600">
              No focus areas selected yet.
            </p>
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
              <p className="mt-3 text-sm leading-6 text-gray-600">
                You haven’t logged a check-in yet.
              </p>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Start today</p>
                <p className="mt-2 text-sm text-gray-600">
                  Add your first daily check-in to begin tracking how you feel.
                </p>
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  );
}
