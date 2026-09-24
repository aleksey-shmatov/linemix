'use client';
import { useEffect, useState } from 'react';

export function RelativeTime({ at }: { at: number }) {
  const [now, setNow] = useState<number | null>(() =>
    typeof window === 'undefined' ? null : Date.now(),
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <time
      dateTime={new Date(at).toISOString()}
      title={new Date(at).toLocaleString()}
      suppressHydrationWarning
      className="text-xs text-neutral-400"
    >
      {now === null ? absolute(at) : relative(at, now)}
    </time>
  );
}

function absolute(at: number): string {
  return new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function relative(at: number, now: number): string {
  const diff = at - now;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  const mins = Math.round(diff / 60_000);
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');

  const hours = Math.round(diff / 3_600_000);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.round(diff / 86_400_000);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');

  return absolute(at);
}
