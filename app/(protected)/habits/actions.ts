"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTodayDateInTimeZone, isValidTimeZone } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function getTimeZone(formData: FormData, fallback: string) {
  const value = formData.get("timezone");

  if (typeof value === "string" && isValidTimeZone(value)) {
    return value;
  }

  return fallback;
}

async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      onboardingDone: true,
      timezone: true,
    },
  });

  if (!profile || !profile.onboardingDone) {
    redirect("/setup");
  }

  return profile;
}

function getHabitId(formData: FormData) {
  const habitIdValue = formData.get("habitId");

  if (typeof habitIdValue !== "string" || !habitIdValue.trim()) {
    throw new Error("Habit id is required.");
  }

  return habitIdValue.trim();
}

async function getActiveHabitForProfile(habitId: string, profileId: string) {
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      profileId,
      archivedAt: null,
      isActive: true,
    },
    select: { id: true },
  });

  if (!habit) {
    throw new Error("Habit not found.");
  }

  return habit;
}

function revalidateHabitPages() {
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function createHabit(formData: FormData) {
  const profile = await getCurrentUserProfile();
  const nameValue = formData.get("name");
  const name =
    typeof nameValue === "string" && nameValue.trim().length > 0
      ? nameValue.trim()
      : null;

  if (!name) {
    throw new Error("Habit name is required.");
  }

  if (name.length > 100) {
    throw new Error("Habit name must be 100 characters or fewer.");
  }

  await prisma.habit.create({
    data: {
      profileId: profile.id,
      name,
    },
  });

  revalidateHabitPages();
}

export async function completeHabitForToday(formData: FormData) {
  const profile = await getCurrentUserProfile();
  const habitId = getHabitId(formData);
  const timezone = getTimeZone(formData, profile.timezone);
  const today = getTodayDateInTimeZone(timezone);

  await getActiveHabitForProfile(habitId, profile.id);

  if (timezone !== profile.timezone) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { timezone },
    });
  }

  await prisma.habitEntry.upsert({
    where: {
      habitId_date: {
        habitId,
        date: today,
      },
    },
    update: {
      completed: true,
    },
    create: {
      profileId: profile.id,
      habitId,
      date: today,
      completed: true,
    },
  });

  revalidateHabitPages();
}

export async function updateHabit(formData: FormData) {
  const profile = await getCurrentUserProfile();
  const habitId = getHabitId(formData);
  const nameValue = formData.get("name");
  const name =
    typeof nameValue === "string" && nameValue.trim().length > 0
      ? nameValue.trim()
      : null;

  if (!name) {
    throw new Error("Habit name is required.");
  }

  if (name.length > 100) {
    throw new Error("Habit name must be 100 characters or fewer.");
  }

  const habit = await getActiveHabitForProfile(habitId, profile.id);

  await prisma.habit.update({
    where: { id: habit.id },
    data: { name },
  });

  revalidateHabitPages();
}

export async function deleteHabit(formData: FormData) {
  const profile = await getCurrentUserProfile();
  const habitId = getHabitId(formData);
  const habit = await getActiveHabitForProfile(habitId, profile.id);

  await prisma.habit.delete({
    where: { id: habit.id },
  });

  revalidateHabitPages();
}
