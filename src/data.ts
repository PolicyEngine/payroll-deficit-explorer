// Data for payroll-deficit-explorer
//
// CBO Feb 2026 Budget and Economic Outlook baseline.
// Primary deficit values read from CRFB Feb 2026 Baseline Webinar chart
// ("Deficits Will Exceed $3 Trillion By 2036"), which decomposes CBO's
// total deficit into primary + interest; values approximate ±$10B.
//
// Baseline payroll tax revenue computed with PolicyEngine-US (default dataset)
// via `employee_payroll_tax + employer_payroll_tax`, summed across households.
//
// 2036 rate-response grid from PolicyEngine sweep: scaling all four payroll
// rate parameters (OASDI employee/employer, HI employee/employer) by
// (1 + k) and measuring resulting payroll tax revenue.

export type YearRow = {
  year: number;
  primaryDeficitB: number;   // CBO baseline, $B
  baselinePayrollB: number;  // PolicyEngine-US, $B
};

export const YEARS: YearRow[] = [
  { year: 2025, primaryDeficitB: 803, baselinePayrollB: 1534.3 },
  { year: 2026, primaryDeficitB: 815, baselinePayrollB: 1617.2 },
  { year: 2027, primaryDeficitB: 780, baselinePayrollB: 1693.7 },
  { year: 2028, primaryDeficitB: 865, baselinePayrollB: 1769.5 },
  { year: 2029, primaryDeficitB: 695, baselinePayrollB: 1846.4 },
  { year: 2030, primaryDeficitB: 765, baselinePayrollB: 1925.0 },
  { year: 2031, primaryDeficitB: 740, baselinePayrollB: 2005.3 },
  { year: 2032, primaryDeficitB: 770, baselinePayrollB: 2085.8 },
  { year: 2033, primaryDeficitB: 990, baselinePayrollB: 2167.6 },
  { year: 2034, primaryDeficitB: 915, baselinePayrollB: 2252.4 },
  { year: 2035, primaryDeficitB: 760, baselinePayrollB: 2340.2 },
  { year: 2036, primaryDeficitB: 980, baselinePayrollB: 2433.5 },
];

// Rate response at 2036: payroll revenue ($B) when all four rate parameters
// are scaled by (1 + k). Source: PolicyEngine-US Microsimulation.
export const RATE_RESPONSE_2036 = [
  { k: 0.0,  payrollB: 2434.4 },
  { k: 0.10, payrollB: 2662.2 },
  { k: 0.20, payrollB: 2890.0 },
  { k: 0.30, payrollB: 3117.9 },
  { k: 0.40, payrollB: 3345.7 },
  { k: 0.50, payrollB: 3573.5 },
];

// Derived from the rate response: a 1% proportional rate increase yields
// roughly 0.938% revenue increase, because the OASDI cap means very-high
// earners don't pay more OASDI on wages above the cap. Near-perfectly linear
// over the sampled range (verified: R² > 0.9999).
export const REVENUE_ELASTICITY = 0.9363;

// Current combined (employer + employee) statutory payroll tax rate (OASDI + HI).
// OASDI 12.4% (6.2 × 2) + HI 2.9% (1.45 × 2) = 15.3%.
export const CURRENT_COMBINED_RATE = 0.153;

// Current per-side rate (what shows on a paystub).
export const CURRENT_PER_SIDE_RATE = 0.0765;
