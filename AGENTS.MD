# What this is
A collaborative drawing game. Players share a canvas and draw freehand strokes, taking turns by convention (the UI shows whose go it is; nothing enforces it). Nobody is given a subject — the drawing becomes something as it goes. When a player thinks they can see what it is, they submit a label and a vision model judges whether the drawing depicts it. 

# Source of truth for versions
Read package.json and the lockfile. Do not rely on recalled version numbers, and do not upgrade or downgrade anything without asking.

# Version traps
TypeScript 7
Node 24 LTS
React 19 + Compiler
Next.js 16

# Working rule
Run pnpm -r typecheck and pnpm -r test after every change, and iterate until both pass before reporting done.

