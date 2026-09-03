"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTodayDateInTimeZone, isValidTimeZone } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

function getTimeZone(formData: FormData, fallback: string) {
  const value = formData.get("timezone");

  if (typeof value === "string" && isValidTimeZone(value)) {
    return value;
  }

  return fallback;
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
    select: {
      id: true,
      onboardingDone: true,
      timezone: true,
    },
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
  const timezone = getTimeZone(formData, profile.timezone);
  const today = getTodayDateInTimeZone(timezone);

  if (timezone !== profile.timezone) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { timezone },
    });
  }

  await prisma.dailyCheckIn.upsert({
    where: {
      profileId_date: {
        profileId: profile.id,
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
      profileId: profile.id,
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
