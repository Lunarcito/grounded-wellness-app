"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function getRequiredScore(
  value: FormDataEntryValue | null,
  fieldName: string,
): number {
  const parsed = toOptionalNumber(value);

  if (
    parsed === null ||
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 5
  ) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
}

function getOptionalScore(
  value: FormDataEntryValue | null,
  fieldName: string,
): number | null {
  const parsed = toOptionalNumber(value);

  if (parsed === null) {
    return null;
  }

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
}

function getOptionalNonNegativeNumber(
  value: FormDataEntryValue | null,
  fieldName: string,
): number | null {
  const parsed = toOptionalNumber(value);

  if (parsed === null) {
    return null;
  }

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
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

  const moodScore = getRequiredScore(formData.get("moodScore"), "mood score");
  const energyScore = getRequiredScore(
    formData.get("energyScore"),
    "energy score",
  );
  const sleepQualityScore = getRequiredScore(
    formData.get("sleepQualityScore"),
    "sleep quality score",
  );
  const stressScore = getOptionalScore(
    formData.get("stressScore"),
    "stress score",
  );
  const waterMl = getOptionalNonNegativeNumber(
    formData.get("waterMl"),
    "water amount",
  );
  const movementMin = getOptionalNonNegativeNumber(
    formData.get("movementMin"),
    "movement minutes",
  );

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
