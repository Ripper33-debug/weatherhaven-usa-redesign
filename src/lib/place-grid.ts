/** Map points are looked up on this grid (degrees): about 28 km, plenty for a place's weather. */
export const PLACE_GRID = 0.25;

/** The grid point the weather for a map point is read at. */
export const snapToGrid = (v: number) => Math.round(v / PLACE_GRID) * PLACE_GRID;
