import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn(),
  findFirstMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  upsertMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClientMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: mocks.findUniqueMock,
      update: mocks.updateMock,
    },
    habit: {
      findFirst: mocks.findFirstMock,
      create: mocks.createMock,
    },
    habitEntry: {
      upsert: mocks.upsertMock,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
}));

import { completeHabitForToday, createHabit } from "./actions";

describe("habit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.createClientMock.mockResolvedValue({
      auth: {
        getUser: mocks.getUserMock,
      },
    });
    mocks.getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
    });
    mocks.findUniqueMock.mockResolvedValue({
      id: "user-1",
      onboardingDone: true,
      timezone: "Europe/Madrid",
    });
    mocks.findFirstMock.mockResolvedValue({ id: "habit-1" });
  });

  it("creates a habit with the authenticated profile id", async () => {
    const formData = new FormData();
    formData.set("name", "Morning walk");

    await createHabit(formData);

    expect(mocks.createClientMock).toHaveBeenCalledTimes(1);
    expect(mocks.getUserMock).toHaveBeenCalledTimes(1);
    expect(mocks.findUniqueMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        id: true,
        onboardingDone: true,
        timezone: true,
      },
    });
    expect(mocks.createMock).toHaveBeenCalledWith({
      data: {
        profileId: "user-1",
        name: "Morning walk",
      },
    });
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/habits");
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });

  it("upserts today's completion for an active habit", async () => {
    const formData = new FormData();
    formData.set("habitId", "habit-1");
    formData.set("timezone", "Europe/Madrid");

    await completeHabitForToday(formData);

    expect(mocks.findFirstMock).toHaveBeenCalledWith({
      where: {
        id: "habit-1",
        profileId: "user-1",
        archivedAt: null,
        isActive: true,
      },
      select: { id: true },
    });
    expect(mocks.upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          habitId_date: {
            habitId: "habit-1",
            date: expect.any(Date),
          },
        },
        update: { completed: true },
        create: expect.objectContaining({
          profileId: "user-1",
          habitId: "habit-1",
          completed: true,
          date: expect.any(Date),
        }),
      }),
    );
  });
});
