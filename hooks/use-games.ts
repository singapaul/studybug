"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Game,
  CreateGameInput,
  FlashcardItem,
  PairsItem,
  MultipleChoiceQuestion,
  FillInTheBlankItem,
  SpeedRoundItem,
} from "@/types/game";

interface ProgressData {
  personalBests: {
    gameId: string;
    gameName: string;
    bestScore: number;
    achievedAt: string;
  }[];
  trend: { date: string; scorePercentage: number; gameName: string }[];
  summary: {
    totalAttempts: number;
    averageScore: number;
    gamesPlayed: number;
  };
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = Object.assign(new Error(body.error ?? "Request failed"), {
      status: res.status,
      code: body.code,
    });
    throw error;
  }
  return res.json();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useGames() {
  return useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      const data = await apiFetch<{ games: Game[] }>("/api/games");
      return data.games;
    },
  });
}

export function useGame(id: string) {
  return useQuery<Game>({
    queryKey: ["games", id],
    queryFn: async () => {
      const data = await apiFetch<{ game: Game }>(`/api/games/${id}`);
      return data.game;
    },
    enabled: !!id,
  });
}

export function useGameAttempts(id: string) {
  return useQuery({
    queryKey: ["games", id, "attempts"],
    queryFn: async () => {
      const data = await apiFetch<{ attempts: unknown[] }>(
        `/api/games/${id}/attempts`
      );
      return data.attempts;
    },
    enabled: !!id,
  });
}

export function useProgress() {
  return useQuery<ProgressData>({
    queryKey: ["progress"],
    queryFn: async () => {
      return apiFetch<ProgressData>("/api/progress");
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateGameInput) => {
      const data = await apiFetch<{ game: Game }>("/api/games", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return data.game;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: { id: string; name?: string; gameData?: unknown }) => {
      const data = await apiFetch<{ game: Game }>(`/api/games/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return data.game;
    },
    onSuccess: (game) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["games", game.id] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/games/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useDuplicateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiFetch<{ game: Game }>(
        `/api/games/${id}/duplicate`,
        { method: "POST" }
      );
      return data.game;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export interface GeneratedGameData {
  flashcards: FlashcardItem[]
  pairs: PairsItem[]
  multipleChoice: MultipleChoiceQuestion[]
  fillInTheBlank: FillInTheBlankItem[]
  speedRound: SpeedRoundItem[]
  usedToday: number
  remainingToday: number
}

export function useShareGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiFetch<{ shareToken: string }>(
        `/api/games/${id}/share`,
        { method: "POST" }
      );
      return data.shareToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUnshareGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/games/${id}/share`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useSharedGame(token: string) {
  return useQuery<Game>({
    queryKey: ["shared-game", token],
    queryFn: async () => {
      const res = await fetch(`/api/games/share/${token}`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw Object.assign(new Error(body.error ?? "Not found"), { status: res.status });
      }
      const data = (await res.json()) as { game: Game };
      return data.game;
    },
    enabled: !!token,
  });
}

export function useGenerateGames() {
  return useMutation({
    mutationFn: async ({ file, topic, gameTypes }: { file: File; topic?: string; gameTypes?: string[] }) => {
      const form = new FormData()
      form.append("file", file)
      if (topic) form.append("topic", topic)
      if (gameTypes && gameTypes.length > 0) form.append("gameTypes", gameTypes.join(","))
      // Use raw fetch — apiFetch sets Content-Type: application/json which breaks multipart
      const res = await fetch("/api/games/generate", {
        method: "POST",
        body: form,
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw Object.assign(new Error(err.error ?? "Generation failed"), {
          code: err.code,
          status: res.status,
        })
      }
      return res.json() as Promise<GeneratedGameData>
    },
  })
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: async ({
      gameId,
      scorePercentage,
      timeTaken,
      attemptData,
    }: {
      gameId: string;
      scorePercentage: number;
      timeTaken: number;
      attemptData?: unknown;
    }) => {
      const data = await apiFetch<{ attempt: unknown }>(
        `/api/games/${gameId}/attempts`,
        {
          method: "POST",
          body: JSON.stringify({ scorePercentage, timeTaken, attemptData }),
        }
      );
      return data.attempt;
    },
  });
}
