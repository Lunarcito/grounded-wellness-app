"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getTodayDateUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function saveDailyCheckIn(formData: FormData) {
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

  const moodScore = toInt(formData.get("moodScore"));
  const energyScore = toInt(formData.get("energyScore"));
  const sleepQualityScore = toInt(formData.get("sleepQualityScore"));
  const stressScore = toInt(formData.get("stressScore"));
  const waterMl = toInt(formData.get("waterMl"));
  const movementMin = toInt(formData.get("movementMin"));

  if (!moodScore || !energyScore || !sleepQualityScore) {
    throw new Error("Missing required daily check-in values.");
  }

  const today = getTodayDateUtc();

  await prisma.dailyCheckIn.upsert({
    where: {
      profileId_date: {
        profileId: user.id,
        date: today,
      },
    },
    update: {
      moodScore,
      energyScore,
      sleepQualityScore,
      stressScore,
      waterMl,
      movementMin,
    },
    create: {
      profileId: user.id,
      date: today,
      moodScore,
      energyScore,
      sleepQualityScore,
      stressScore,
      waterMl,
      movementMin,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/check-in");
  redirect("/dashboard");
}
