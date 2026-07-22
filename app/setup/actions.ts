"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function completeSetup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const displayNameValue = formData.get("displayName");
  const timezoneValue = formData.get("timezone");
  const wellnessGoalValue = formData.get("wellnessGoal");
  const focusAreasValues = formData.getAll("focusAreas");
  const waterGoalMlValue = formData.get("waterGoalMl");
  const movementGoalMinValue = formData.get("movementGoalMin");

  const displayName =
    typeof displayNameValue === "string" && displayNameValue.trim().length > 0
      ? displayNameValue.trim()
      : null;

  const timezone =
    typeof timezoneValue === "string" && timezoneValue.trim().length > 0
      ? timezoneValue.trim()
      : "UTC";

  const wellnessGoal =
    typeof wellnessGoalValue === "string" && wellnessGoalValue.trim().length > 0
      ? wellnessGoalValue.trim()
      : null;

  const focusAreas = focusAreasValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .join(",");

  const waterGoalMl = Number(waterGoalMlValue);
  const movementGoalMin = Number(movementGoalMinValue);

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      email: user.email,
      displayName,
      timezone,
      wellnessGoal,
      focusAreas,
      waterGoalMl: Number.isFinite(waterGoalMl) ? waterGoalMl : 2000,
      movementGoalMin: Number.isFinite(movementGoalMin) ? movementGoalMin : 30,
      onboardingDone: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/setup");
  redirect("/dashboard");
}
