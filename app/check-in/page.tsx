import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { saveDailyCheckIn } from "./actions";

function getTodayDateUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export default async function CheckInPage() {
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

  const today = getTodayDateUtc();

  const existingCheckIn = await prisma.dailyCheckIn.findUnique({
    where: {
      profileId_date: {
        profileId: user.id,
        date: today,
      },
    },
  });

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Daily check-in</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            How are you feeling today?
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Take a minute to log how your day is going.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      <form
        action={saveDailyCheckIn}
        className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="moodScore"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Mood
            </label>
            <select
              id="moodScore"
              name="moodScore"
              defaultValue={existingCheckIn?.moodScore ?? ""}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
              required
            >
              <option value="" disabled>
                Select a score
              </option>
              <option value="1">1 - Very low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Okay</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Great</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="energyScore"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Energy
            </label>
            <select
              id="energyScore"
              name="energyScore"
              defaultValue={existingCheckIn?.energyScore ?? ""}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
              required
            >
              <option value="" disabled>
                Select a score
              </option>
              <option value="1">1 - Very low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Steady</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sleepQualityScore"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Sleep quality
            </label>
            <select
              id="sleepQualityScore"
              name="sleepQualityScore"
              defaultValue={existingCheckIn?.sleepQualityScore ?? ""}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
              required
            >
              <option value="" disabled>
                Select a score
              </option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Light</option>
              <option value="3">3 - Fair</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Restful</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="stressScore"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Stress
            </label>
            <select
              id="stressScore"
              name="stressScore"
              defaultValue={existingCheckIn?.stressScore ?? ""}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            >
              <option value="">Not set</option>
              <option value="1">1 - Very low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Moderate</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Very high</option>
            </select>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="waterMl"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Water today (ml)
            </label>
            <input
              id="waterMl"
              name="waterMl"
              type="number"
              min="0"
              step="100"
              defaultValue={existingCheckIn?.waterMl ?? profile.waterGoalMl}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="movementMin"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Movement today (min)
            </label>
            <input
              id="movementMin"
              name="movementMin"
              type="number"
              min="0"
              step="5"
              defaultValue={
                existingCheckIn?.movementMin ?? profile.movementGoalMin
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {existingCheckIn
              ? "You already have a check-in for today. Saving again will update it."
              : "Your first check-in helps shape your dashboard over time."}
          </p>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {existingCheckIn ? "Update check-in" : "Save check-in"}
          </button>
        </div>
      </form>
    </main>
  );
}
