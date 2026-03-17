/**
 * islamicOccasion.js
 * Returns the current Islamic occasion based on approximate Gregorian date ranges.
 * Dates are approximate (moon sighting may shift ±1-2 days).
 *
 * Returns one of: "ramadan" | "eid_fitr" | "eid_adha" | null
 */

const OCCASIONS = [
  // ── 2026 ──
  { year: 2026, type: "ramadan",   start: [2026, 2, 18],  end: [2026, 3, 19] },
  { year: 2026, type: "eid_fitr",  start: [2026, 3, 20],  end: [2026, 3, 23] },
  { year: 2026, type: "eid_adha",  start: [2026, 5, 27],  end: [2026, 5, 31] },

  // ── 2027 ──
  { year: 2027, type: "ramadan",   start: [2027, 2,  7],  end: [2027, 3,  8] },
  { year: 2027, type: "eid_fitr",  start: [2027, 3,  9],  end: [2027, 3, 12] },
  { year: 2027, type: "eid_adha",  start: [2027, 5, 16],  end: [2027, 5, 20] },

  // ── 2028 ──
  { year: 2028, type: "ramadan",   start: [2028, 1, 27],  end: [2028, 2, 25] },
  { year: 2028, type: "eid_fitr",  start: [2028, 2, 26],  end: [2028, 3,  1] },
  { year: 2028, type: "eid_adha",  start: [2028, 5,  4],  end: [2028, 5,  8] },
];

/**
 * @returns {"ramadan"|"eid_fitr"|"eid_adha"|null}
 */
export function getIslamicOccasion(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-based
  const d = date.getDate();

  const toNum = ([yr, mo, dy]) => yr * 10000 + mo * 100 + dy;
  const now = toNum([y, m, d]);

  for (const o of OCCASIONS) {
    if (now >= toNum(o.start) && now <= toNum(o.end)) {
      return o.type;
    }
  }
  return null;
}
