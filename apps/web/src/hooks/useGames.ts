import { listGames, createGame } from '@/server/games';
import type { Game } from '@linemix/model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const gameKeys = { all: ['games'] as const };

export function useGames() {
  return useQuery({
    queryKey: gameKeys.all,
    queryFn: async (): Promise<Game[]> => listGames(),
  });
}

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<Game> => {
      const res = await createGame({ name });
      if (!res.ok) throw new Error(res.reason);
      return res.game;
    },
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: gameKeys.all });
      const prev = qc.getQueryData<Game[]>(gameKeys.all);
      qc.setQueryData<Game[]>(gameKeys.all, (old = []) => [
        ...old,
        {
          id: `game_pending_${Date.now()}`,
          name,
          createdAt: Date.now(),
          ownerId: 'pending',
          visibility: 'public' as const,
        },
      ]);
      return { prev };
    },
    onError: (_err, _name, ctx) => qc.setQueryData(gameKeys.all, ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: gameKeys.all }),
  });
}
