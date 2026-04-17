import { YEARS, CURRENT_COMBINED_RATE, REVENUE_ELASTICITY } from "./data";

export type PathRow = {
  year: number;
  primaryDeficitB: number;
  baselinePayrollB: number;
  reformPayrollB: number;
  primaryDeficitAfterB: number;
  combinedRatePct: number;
};

/**
 * Solve for the fractional payroll-rate increase k needed to eliminate the
 * primary deficit in `targetYear`, assuming:
 *  - rates rise linearly from 0 extra in `startYear - 1` to +k in `targetYear`;
 *  - revenue responds with constant elasticity (PolicyEngine static score).
 *
 * Returns the final k (fractional) and the full year-by-year path.
 */
export function solvePath(startYear: number, targetYear: number) {
  const target = YEARS.find((r) => r.year === targetYear);
  if (!target) throw new Error(`No data for ${targetYear}`);

  // At target year, reform revenue = baseline × (1 + k × elasticity).
  // Want: extra revenue = primary deficit.
  const k = target.primaryDeficitB / (target.baselinePayrollB * REVENUE_ELASTICITY);

  const rows: PathRow[] = YEARS.filter((r) => r.year >= startYear - 1).map(
    (r) => {
      const span = targetYear - (startYear - 1);
      const progress = Math.max(
        0,
        Math.min(1, (r.year - (startYear - 1)) / span),
      );
      const kYear = k * progress;
      const extraRev = r.baselinePayrollB * kYear * REVENUE_ELASTICITY;
      return {
        year: r.year,
        primaryDeficitB: r.primaryDeficitB,
        baselinePayrollB: r.baselinePayrollB,
        reformPayrollB: r.baselinePayrollB + extraRev,
        primaryDeficitAfterB: r.primaryDeficitB - extraRev,
        combinedRatePct: CURRENT_COMBINED_RATE * (1 + kYear) * 100,
      };
    },
  );

  return { k, rows, target };
}

export function fmtPct(x: number, digits = 1): string {
  return `${x.toFixed(digits)}%`;
}

export function fmtB(x: number): string {
  const sign = x < 0 ? "−" : "";
  return `${sign}$${Math.abs(x).toFixed(0)}B`;
}

export function fmtBSigned(x: number): string {
  const sign = x >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(x).toFixed(0)}B`;
}
