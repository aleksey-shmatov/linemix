'use client';
import { useState } from "react";
import { createStore, empty } from "@linemix/model";
import { Strokes } from "./Strokes";

export function Canvas() {
    const [store] = useState(() => createStore(empty));
    return <svg viewBox="0 0 100 100" className="w-full h-full">
        <Strokes store={store} />
    </svg>;
}