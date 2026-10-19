'use client';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { createClient } from '@/lib/supabase/client';
import type { GameId } from '@linemix/model';
import { toBase64 } from '@/lib/base64';

const FLUSH_MS = 500;
export type SaveState = 'saved' | 'saving' | 'error';

export function usePersistence(ydoc: Y.Doc, gameId: GameId) {
  const [state, setState] = useState<SaveState>('saved');

  useEffect(() => {
    const supabase = createClient();
    const pending: Uint8Array[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;

    const schedule = () => {
      timer ??= setTimeout(() => void flush(), FLUSH_MS);
    };

    const flush = async () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (pending.length === 0) return;

      const batch = pending.splice(0);
      const { error } = await supabase.from('doc_updates').insert({
        game_id: gameId,
        update: toBase64(Y.mergeUpdates(batch)),
      });

      if (error) {
        failures += 1;
        if (failures >= 5) {
          console.error('[persist] too many failures, giving up');
          return;
        }
        console.error('[persist] failed', error);
        setState('error');
        pending.unshift(...batch);
        schedule();
      } else {
        failures = 0;
        setState('saved');
      }
    };

    const beacon = () => {
      if (pending.length === 0) return;

      const batch = pending.splice(0);
      const body = JSON.stringify({
        gameId,
        update: toBase64(Y.mergeUpdates(batch)),
      });

      const queued = navigator.sendBeacon(
        '/api/flush',
        new Blob([body], { type: 'application/json' }),
      );
      if (!queued) pending.unshift(...batch);
    };

    const onUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === 'remote') return;
      setState('saving');
      pending.push(update);
      schedule();
    };

    const onHide = () => {
      if (document.visibilityState === 'hidden') beacon();
    };

    ydoc.on('update', onUpdate);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      ydoc.off('update', onUpdate);
      document.removeEventListener('visibilitychange', onHide);
      void flush();
    };
  }, [ydoc, gameId]);
  return state;
}
