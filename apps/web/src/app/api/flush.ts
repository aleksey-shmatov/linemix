import { createClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  const { gameId, update } = await req.json();
  const supabase = await createClient();
  const { error } = await supabase.from('doc_updates').insert({
    game_id: gameId,
    update,
  });
  return error ? new Response(null, { status: 500 }) : new Response(null, { status: 204 });
}
