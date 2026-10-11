'use client';
import { useEffect } from 'react';
import * as Y from 'yjs';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { GameId } from '@linemix/model';
import { fromBase64, toBase64 } from '@/lib/base64';

export function useRealtime(ydoc: Y.Doc, gameId: GameId) {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let onUpdate: ((u: Uint8Array, origin: unknown) => void) | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) {
        console.warn('[rt] no session, not subscribing');
        return;
      }

      await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;

      const ch = supabase.channel(gameId, { config: { private: true } });

      ch.on('broadcast', { event: 'y' }, ({ payload }) => {
        Y.applyUpdate(ydoc, fromBase64(payload.u), 'remote');
      });

      onUpdate = (update, origin) => {
        if (origin === 'remote') return;
        void ch.send({ type: 'broadcast', event: 'y', payload: { u: toBase64(update) } })
      };

      ch.subscribe((status, err) => {
        console.log('[rt] subscribe', status, err ?? '');
      });

      ydoc.on('update', onUpdate);
      channel = ch;
    })();

    return () => {
      cancelled = true;
      if (onUpdate) ydoc.off('update', onUpdate);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [ydoc, gameId]);
}