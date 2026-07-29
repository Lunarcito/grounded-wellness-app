"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function getTodayDateUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

async function getCurrentUserProfileId() {
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

  return user.id;
}

export async function createHabit(formData: FormData) {
  const profileId = await getCurrentUserProfileId();

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
      profileId,
      name,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function completeHabitForToday(formData: FormData) {
  const profileId = await getCurrentUserProfileId();

  const habitIdValue = formData.get("habitId");

  if (typeof habitIdValue !== "string" || !habitIdValue.trim()) {
    throw new Error("Habit id is required.");
  }

  const habitId = habitIdValue.trim();

  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      profileId,
      archivedAt: null,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!habit) {
    throw new Error("Habit not found.");
  }

  const today = getTodayDateUtc();

  await prisma.habitEntry.upsert({
    where: {
      habitId_date: {
        habitId,
        date: today,
      },
    },
    update: {},
    create: {
      habitId,
      profileId,
      date: today,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}