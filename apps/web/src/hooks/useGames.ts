import { listGames } from '@/server/games';
import type { Game } from '@linemix/model';
import { useQuery } from '@tanstack/react-query';

export const gameKeys = { all: ['games'] as const };

export function useGames() {
  return useQuery({
    queryKey: gameKeys.all,
    queryFn: async (): Promise<Game[]> => listGames(),
  });
}
