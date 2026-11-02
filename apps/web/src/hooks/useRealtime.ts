'use client';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { GameId } from '@linemix/model';
import { fromBase64, toBase64 } from '@/lib/base64';

export type ChannelState = 'connecting' | 'joined' | 'error';

type SyncMsg = { from: number; to?: number } & (
  | { t: 'sv1'; sv: string }
  | { t: 'sv2'; sv: string; diff: string | null }
  | { t: 'd'; diff: string }
);

const MAX_DIFF = 180_000; // base64 chars, under Supabase's 256 KB message cap

export function useRealtime(ydoc: Y.Doc, gameId: GameId) {
  const [state, setState] = useState<ChannelState>('connecting');

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

      const mySv = () => toBase64(Y.encodeStateVector(ydoc));

      const diffFor = (theirSv: string): string | null => {
        const d = Y.encodeStateAsUpdate(ydoc, fromBase64(theirSv));
        if (d.length <= 2) return null; // they're caught up
        const b64 = toBase64(d);
        if (b64.length > MAX_DIFF) {
          console.warn('[sync] diff too large to broadcast:', b64.length);
          return null;
        }
        return b64;
      };

      ch.on('broadcast', { event: 'sync' }, ({ payload }: { payload: SyncMsg }) => {
        const me = ydoc.clientID;
        if (payload.from === me) return;
        if ('to' in payload && payload.to !== me) return;
        switch (payload.t) {
          case 'sv1': {
            const diff = diffFor(payload.sv);
            ch.send({
              type: 'broadcast',
              event: 'sync',
              payload: { t: 'sv2', from: me, to: payload.from, sv: mySv(), diff },
            });
            break;
          }
          case 'sv2': {
            if (payload.diff) Y.applyUpdate(ydoc, fromBase64(payload.diff), 'remote');
            const diff = diffFor(payload.sv);
            if (diff)
              ch.send({
                type: 'broadcast',
                event: 'sync',
                payload: { t: 'd', from: me, to: payload.from, diff },
              });
            break;
          }
          case 'd':
            Y.applyUpdate(ydoc, fromBase64(payload.diff), 'remote');
            break;
        }
      });

      onUpdate = (update, origin) => {
        if (origin === 'remote') return;
        void ch.send({ type: 'broadcast', event: 'y', payload: { u: toBase64(update) } });
      };

      ch.subscribe((status, err) => {
        if (err) console.error('[rt]', status, err);
        if (status === 'SUBSCRIBED') {
          void ch.send({
            type: 'broadcast',
            event: 'sync',
            payload: { t: 'sv1', from: ydoc.clientID, sv: mySv() },
          });
        }
        setState(
          status === 'SUBSCRIBED' ? 'joined' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting',
        );
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
  return state;
}
