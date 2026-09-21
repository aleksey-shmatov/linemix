import { CreateGameSchema, gameId } from '@linemix/model';
import { games } from '@/server/games';

export async function GET() {
  return Response.json(games);
}

export async function POST(req: Request) {
  const parsed = CreateGameSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json(parsed.error, { status: 400 });
  const game = { id: gameId(), name: parsed.data.name, createdAt: Date.now() };
  games.push(game);
  return Response.json(game, { status: 201 });
}