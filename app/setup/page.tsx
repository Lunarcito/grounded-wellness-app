import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { completeSetup } from "./actions";

export default async function SetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
    },
    create: {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name ?? null,
      timezone: "UTC",
      onboardingDone: false,
      waterGoalMl: 2000,
      movementGoalMin: 30,
    },
  });

  if (profile.onboardingDone) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500">Initial setup</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Personalize your wellness space
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Start with a few preferences. You can change them later.
        </p>
      </div>

      <form
        action={completeSetup}
        className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <section className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={profile.displayName ?? ""}
              placeholder="Carolina"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              defaultValue={profile.timezone}
              placeholder="Europe/Madrid"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>
        </section>

        <section className="space-y-4">
          <fieldset>
            <legend className="mb-3 block text-sm font-medium text-gray-900">
              Main wellness goal
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "reduce_stress", label: "Reduce stress" },
                { value: "sleep_better", label: "Sleep better" },
                { value: "move_more", label: "Move more" },
                { value: "journal_daily", label: "Journal daily" },
                { value: "build_consistency", label: "Build consistency" },
              ].map((goal) => (
                <label
                  key={goal.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-gray-400"
                >
                  <input
                    type="radio"
                    name="wellnessGoal"
                    value={goal.value}
                    defaultChecked={profile.wellnessGoal === goal.value}
                    className="h-4 w-4"
                  />
                  <span>{goal.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="space-y-4">
          <fieldset>
            <legend className="mb-3 block text-sm font-medium text-gray-900">
              Focus areas
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "mindfulness", label: "Mindfulness" },
                { value: "sleep", label: "Sleep" },
                { value: "movement", label: "Movement" },
                { value: "journaling", label: "Journaling" },
                { value: "hydration", label: "Hydration" },
              ].map((area) => (
                <label
                  key={area.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-gray-400"
                >
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value={area.value}
                    defaultChecked={profile.focusAreas
                      ?.split(",")
                      .includes(area.value)}
                    className="h-4 w-4"
                  />
                  <span>{area.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="waterGoalMl"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Daily water goal (ml)
            </label>
            <input
              id="waterGoalMl"
              name="waterGoalMl"
              type="number"
              min="0"
              step="100"
              defaultValue={profile.waterGoalMl}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="movementGoalMin"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Daily movement goal (min)
            </label>
            <input
              id="movementGoalMin"
              name="movementGoalMin"
              type="number"
              min="0"
              step="5"
              defaultValue={profile.movementGoalMin}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            These preferences can be updated later.
          </p>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Save and continue
          </button>
        </div>
      </form>
    </main>
  );
}
