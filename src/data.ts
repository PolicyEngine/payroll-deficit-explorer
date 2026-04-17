// Baseline inputs for the payroll-deficit-explorer.
//
// Primary deficits and payroll tax revenue: CBO, February 2026 Budget and
// Economic Outlook, Table 1-1 ("CBO's Baseline Budget Projections"), page 3.
// https://www.cbo.gov/publication/62105
//
// Rate response: PolicyEngine-US, computed in scripts/precompute.py by
// scaling all four statutory payroll rate parameters (OASDI employee/
// employer, HI employee/employer) by a common factor (1 + k) and summing
// `employee_payroll_tax + employer_payroll_tax`. The resulting response is
// near-linear; the app fits the slope at runtime to recover an implied
// revenue-per-rate elasticity.

export type YearRow = {
  year: number;
  primaryDeficitB: number; // CBO baseline, $B (Table 1-1 value times −1)
  cboPayrollB: number;     // CBO baseline payroll tax revenue, $B
};

export const YEARS: YearRow[] = [
  { year: 2025, primaryDeficitB: 805, cboPayrollB: 1748 },
  { year: 2026, primaryDeficitB: 814, cboPayrollB: 1826 },
  { year: 2027, primaryDeficitB: 779, cboPayrollB: 1897 },
  { year: 2028, primaryDeficitB: 862, cboPayrollB: 1970 },
  { year: 2029, primaryDeficitB: 695, cboPayrollB: 2048 },
  { year: 2030, primaryDeficitB: 769, cboPayrollB: 2132 },
  { year: 2031, primaryDeficitB: 737, cboPayrollB: 2216 },
  { year: 2032, primaryDeficitB: 769, cboPayrollB: 2302 },
  { year: 2033, primaryDeficitB: 996, cboPayrollB: 2389 },
  { year: 2034, primaryDeficitB: 915, cboPayrollB: 2478 },
  { year: 2035, primaryDeficitB: 760, cboPayrollB: 2570 },
  { year: 2036, primaryDeficitB: 971, cboPayrollB: 2666 },
];

// PolicyEngine-US 2036 rate-response grid. Each row shows total payroll
// tax revenue when all four statutory rate parameters are scaled by (1 + k).
// Source: scripts/precompute.py; raw output in pe-data.json.
export const RATE_RESPONSE_2036 = [
  { k: 0.0, payrollB: 2434.4 },
  { k: 0.1, payrollB: 2662.2 },
  { k: 0.2, payrollB: 2890.0 },
  { k: 0.3, payrollB: 3117.9 },
  { k: 0.4, payrollB: 3345.7 },
  { k: 0.5, payrollB: 3573.5 },
];

// Current combined (employer + employee) statutory payroll rate:
// OASDI 12.4% (6.2 × 2) + Medicare HI 2.9% (1.45 × 2) = 15.3%.
export const CURRENT_COMBINED_RATE = 0.062 * 2 + 0.0145 * 2;
export const CURRENT_PER_SIDE_RATE = CURRENT_COMBINED_RATE / 2;
