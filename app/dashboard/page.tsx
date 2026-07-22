import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
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

  if (!profile.onboardingDone) {
    redirect("/setup");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <p className="mt-2 text-gray-600">Signed in as {profile.email}</p>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-medium">Dashboard</h2>
        <p className="mt-2 text-gray-600"></p>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Timezone:</strong> {profile.timezone}
          </p>
        </div>
      </section>
    </main>
  );
}
