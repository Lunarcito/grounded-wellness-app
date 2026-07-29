"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createHabit(formData: FormData) {
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

  const nameValue = formData.get("name");

  const name =
    typeof nameValue === "string" && nameValue.trim().length > 0
      ? nameValue.trim()
      : null;

  if (!name) {
    throw new Error("Habit name is required.");
  }

  await prisma.habit.create({
    data: {
      profileId: user.id,
      name,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}
