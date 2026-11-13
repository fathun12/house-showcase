export const MOTIONS = ["none", "slide", "hinge"] as const;
export type Motion = (typeof MOTIONS)[number];

export const DIRS = ["x+", "x-", "y+", "y-", "z+", "z-"] as const;
export type Dir = (typeof DIRS)[number];

export const AXES = ["x", "y", "z"] as const;
export type Axis = (typeof AXES)[number];

export const SIDES = ["min", "max"] as const;
export type Side = (typeof SIDES)[number];

/** Slide uses dir + amount (percent of the part's own size). Hinge uses axis, angle and the pivot edge. */
export type PartSettings = {
  dir: Dir;
  amount: number;
  axis: Axis;
  angle: number;
  pivotA: Side;
  pivotB: Side;
};

export const DEFAULT_SETTINGS: PartSettings = {
  dir: "z+",
  amount: 80,
  axis: "y",
  angle: 90,
  pivotA: "min",
  pivotB: "min",
};

export type PartConfig = {
  label: string;
  motion: Motion;
  settings: PartSettings;
};

/** The two axes that are not the hinge axis, in x, y, z order. */
export function otherAxes(axis: Axis): [Axis, Axis] {
  return AXES.filter((item) => item !== axis) as [Axis, Axis];
}

function pick<T extends string>(list: readonly T[], input: unknown, fallback: T): T {
  return list.includes(input as T) ? (input as T) : fallback;
}

function num(input: unknown, fallback: number, min: number, max: number) {
  return typeof input === "number" && Number.isFinite(input)
    ? Math.min(max, Math.max(min, input))
    : fallback;
}

/** Turns whatever is stored in the database into valid settings. */
export function readSettings(raw: unknown): PartSettings {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    dir: pick(DIRS, value.dir, DEFAULT_SETTINGS.dir),
    amount: num(value.amount, DEFAULT_SETTINGS.amount, 5, 300),
    axis: pick(AXES, value.axis, DEFAULT_SETTINGS.axis),
    angle: num(value.angle, DEFAULT_SETTINGS.angle, -170, 170),
    pivotA: pick(SIDES, value.pivotA, DEFAULT_SETTINGS.pivotA),
    pivotB: pick(SIDES, value.pivotB, DEFAULT_SETTINGS.pivotB),
  };
}