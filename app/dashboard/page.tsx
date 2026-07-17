import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">You are logged in as {user.email}</p>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-medium">Grounded MVP</h2>
        <p className="mt-2 text-gray-600">
          Authentication done
        </p>
      </section>
    </main>
  );
}