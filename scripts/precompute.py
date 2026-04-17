"""Precompute PolicyEngine-US baseline payroll tax revenue and a rate-response
grid used by the web app. Writes pe-data.json at the repo root.
"""
import json
from pathlib import Path

from policyengine_us import Microsimulation
from policyengine_core.reforms import Reform

SS_RATE = 0.062
HI_RATE = 0.0145
YEARS = list(range(2025, 2037))
K_GRID = [0.0, 0.10, 0.20, 0.30, 0.40, 0.50]
OUT = Path(__file__).resolve().parents[1] / "pe-data.json"


def make_reform(scale_factor: float, year: int) -> Reform:
    new_ss = SS_RATE * (1 + scale_factor)
    new_hi = HI_RATE * (1 + scale_factor)
    period = f"{year}-01-01.{year}-12-31"
    return Reform.from_dict(
        {
            "gov.irs.payroll.social_security.rate.employee": {period: new_ss},
            "gov.irs.payroll.social_security.rate.employer": {period: new_ss},
            "gov.irs.payroll.medicare.rate.employee": {period: new_hi},
            "gov.irs.payroll.medicare.rate.employer": {period: new_hi},
        },
        "policyengine_us",
    )


def total_payroll_tax_b(sim: Microsimulation, year: int) -> float:
    return (
        sim.calc("employee_payroll_tax", period=year).sum()
        + sim.calc("employer_payroll_tax", period=year).sum()
    ) / 1e9


def main() -> None:
    print("Building baseline...", flush=True)
    baseline = Microsimulation()

    data = {"years": [], "baseline_payroll_b": []}
    for y in YEARS:
        pt = total_payroll_tax_b(baseline, y)
        data["years"].append(y)
        data["baseline_payroll_b"].append(round(pt, 1))
        print(f"  {y}: ${pt:,.1f}B", flush=True)

    print("\nRate response grid (2036)...", flush=True)
    data["rate_response_2036"] = []
    for k in K_GRID:
        if k == 0.0:
            rev = data["baseline_payroll_b"][-1]
        else:
            r = Microsimulation(reform=make_reform(k, 2036))
            rev = total_payroll_tax_b(r, 2036)
        data["rate_response_2036"].append({"k": k, "payroll_b": round(rev, 1)})
        print(f"  k={k:.2f}: ${rev:,.1f}B", flush=True)

    OUT.write_text(json.dumps(data, indent=2))
    print(f"\nSaved {OUT}", flush=True)


if __name__ == "__main__":
    main()
