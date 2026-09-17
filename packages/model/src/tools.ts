type ToolDef = {label: string; defaultWidth: number; minWidth?: number}

export const Tools = {
    pen: {label: 'Pen', defaultWidth: 2},
    marker: {label: 'Marker', defaultWidth: 8},
    eraser: {label: 'Eraser', defaultWidth: 10, minWidth: 2},
} as const satisfies Record<string, ToolDef>

export type ToolName = keyof typeof Tools;