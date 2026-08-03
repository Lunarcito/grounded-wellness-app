import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  createClientMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  findFirstMock: vi.fn(),
  upsertMock: vi.fn(),
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClientMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: mocks.findUniqueMock,
    },
    habit: {
      create: mocks.createMock,
      findFirst: mocks.findFirstMock,
    },
    habitEntry: {
      upsert: mocks.upsertMock,
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePathMock,
}));

import { createHabit, completeHabitForToday } from "./actions";

describe("habit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a habit with profileId", async () => {
    mocks.createClientMock.mockReturnValue({
      auth: {
        getUser: mocks.getUserMock,
      },
    });

    mocks.getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
        },
      },
    });

    mocks.findUniqueMock.mockResolvedValue({
      id: "user-1",
      onboardingDone: true,
    });

    const formData = new FormData();
    formData.set("name", "Morning walk");

    await createHabit(formData);

    expect(mocks.createClientMock).toHaveBeenCalledTimes(1);
    expect(mocks.getUserMock).toHaveBeenCalledTimes(1);
    expect(mocks.findUniqueMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
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

  it("upserts today's completion for a habit", async () => {
    mocks.createClientMock.mockReturnValue({
      auth: {
        getUser: mocks.getUserMock,
      },
    });

    mocks.getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
        },
      },
    });

    mocks.findUniqueMock.mockResolvedValue({
      id: "user-1",
      onboardingDone: true,
    });

    mocks.findFirstMock.mockResolvedValue({
      id: "habit-1",
    });

    const formData = new FormData();
    formData.set("habitId", "habit-1");

    await completeHabitForToday(formData);

    expect(mocks.createClientMock).toHaveBeenCalledTimes(1);
    expect(mocks.getUserMock).toHaveBeenCalledTimes(1);
    expect(mocks.findFirstMock).toHaveBeenCalledWith({
      where: {
        id: "habit-1",
        profileId: "user-1",
        archivedAt: null,
        isActive: true,
      },
      select: {
        id: true,
      },
    });
    expect(mocks.upsertMock).toHaveBeenCalled();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/habits");
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });
});
