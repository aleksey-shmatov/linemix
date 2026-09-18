import { toPath, type Store } from "@linemix/model";
import { useDoc } from "../../hooks/useDoc.js";

export function Strokes({ store }: { store: Store }) {
  const strokes = useDoc(store, s => s.strokes);
  return <>{strokes.map(s => <path key={s.id} d={toPath(s.points)} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}</>;
}