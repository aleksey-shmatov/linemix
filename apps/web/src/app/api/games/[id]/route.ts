import { z } from 'zod';
import { judge } from '@/server/judge';
import { isGameId } from '@linemix/model';

const Body = z.object({ guess: z.string().trim().min(1).max(40) });
const THRESHOLD = 0.7;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.warn(params, id)
  if (!isGameId(id)) return Response.json({ error: 'unknown game' }, { status: 404 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: 'invalid guess' }, { status: 400 });

  try {
    const verdict = await judge(body.data.guess);
    return Response.json({ ...verdict, accepted: verdict.match >= THRESHOLD });
  } catch {
    return Response.json({ error: 'judge unavailable' }, { status: 502 });
  }
}
