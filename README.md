# Payroll tax deficit explorer

Interactive tool answering: **how much would US payroll tax rates need to rise to eliminate the federal primary deficit by 2036**, with a linear phase-in?

**Headline result (default settings):** combined OASDI + Medicare HI rate rises from **15.30%** today to **21.88%** in 2036 — a **+6.58pp** increase, or **+0.60pp per year** linearly from 2026. Per-side (paystub) rate rises from 7.65% to 10.94%.

## Inputs

- **Baseline deficits** — CBO's [February 2026 Budget and Economic Outlook](https://www.cbo.gov/publication/62105). Year-by-year primary deficit decomposition read from CRFB's [February 2026 Baseline Webinar](https://www.crfb.org/sites/default/files/media/documents/February_2026_CBO_Baseline_Webinar.pdf).
- **Baseline payroll tax revenue** — computed with [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us) on the default national dataset (enhanced CPS, uprated). Sum of `employee_payroll_tax` and `employer_payroll_tax`.
- **Rate response** — PolicyEngine sweep scaling OASDI employee/employer (6.2% each) and HI employee/employer (1.45% each) by a common factor (1 + k). Near-linear: each +1% proportional rate increase yields +0.94% revenue. The shortfall reflects the OASDI wage-base cap (≈$194,400 in 2026), which exempts wages above the cap from the OASDI portion.

## Assumptions

- **Static scoring** — no labor-supply response. Dynamic estimate with ~15–25% behavioral offset would require a correspondingly steeper rate path.
- **Target year only** — linear ramp leaves positive residual primary deficits in intermediate years.
- **No spending side** — only payroll taxes are changed. Ignores impacts on Social Security / Medicare benefit obligations, and excludes interactions with Social Security benefit formulas.

## Development

```bash
bun install
bun dev       # http://localhost:5173
bun run build
```

### Reproduce the PolicyEngine inputs

```bash
python scripts/precompute.py
# writes pe-data.json with baseline payroll revenue and rate-response grid
```

Requires `policyengine-us` installed in a virtual environment.

## License

MIT.
