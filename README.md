# Payroll tax deficit explorer

A mechanical what-if: under a hypothetical in which federal payroll tax rates are the sole lever, what proportional rate path — phasing in linearly from a chosen start year to a target year — would fully offset CBO's projected primary deficit in the target year? Not a policy recommendation.

## Default result (2026 → 2036 ramp)

Using CBO's February 2026 baseline and a PolicyEngine-US rate-response grid, the combined OASDI + Medicare HI rate rises from **15.30%** today to roughly **21.2%** in 2036 (+5.9pp over 11 years, ≈+0.54pp per year). Per-side (paystub) rate rises from 7.65% to about 10.6%. Target year 2036 primary deficit ($971B) is offset by construction; intermediate years retain positive residual primary deficits.

## Inputs

- **Primary deficits and baseline payroll tax revenue** — CBO's [Budget and Economic Outlook: 2026 to 2036](https://www.cbo.gov/publication/62105), Table 1-1, February 2026. Primary deficits exclude net outlays for interest.
- **Revenue response to rate changes** — [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us) on the default national dataset (enhanced CPS, uprated). A sweep scales OASDI and Medicare HI rate parameters by a common factor (1 + k) for k ∈ {0, 0.1, 0.2, 0.3, 0.4, 0.5}. The app fits an OLS slope through the origin at runtime, producing an implied revenue elasticity of about 0.94 — a 1% proportional rate increase yields ≈0.94% more payroll revenue. The shortfall reflects the OASDI wage-base cap (≈$194,400 in 2026), which exempts wages above the cap from the OASDI portion.

## Assumptions held fixed

- **OASDI wage-base cap is not changed.** Lifting or raising the cap is an alternative payroll-side lever not modeled here.
- **SS/Medicare benefit formulas are not re-scored.** The reform does not feed back into program outlays.
- **Net interest savings ignored.** Lower debt accumulation would reduce future interest outlays; omitting this biases the required rate path slightly upward.
- **Static scoring.** PolicyEngine's payroll-tax calculation is mechanical — no labor-supply response.
- **Target year only.** Linear ramp leaves positive residual primary deficits in intermediate years.
- **Constant elasticity.** The rate-response grid was fit at 2036; the same elasticity is applied to earlier years.

## Development

```bash
bun install
bun dev       # http://localhost:5173
bun run build
```

### Regenerate the PolicyEngine rate-response grid

```bash
python scripts/precompute.py
# writes pe-data.json; values are transcribed into src/data.ts by hand
```

Requires `policyengine-us` installed in a virtual environment. CBO baseline values in `src/data.ts` are transcribed directly from Table 1-1 of the February 2026 outlook.

## License

MIT.
