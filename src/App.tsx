import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  CURRENT_COMBINED_RATE,
  CURRENT_PER_SIDE_RATE,
  YEARS,
} from "./data";
import { fmtB, fmtBSigned, solvePath } from "./model";
import "./App.css";

const MIN_YEAR = YEARS[0].year;
const MAX_YEAR = YEARS[YEARS.length - 1].year;
const START_YEAR_OPTIONS = YEARS.filter((r) => r.year >= 2026 && r.year <= MAX_YEAR - 4).map(
  (r) => r.year,
);

function App() {
  const [targetYear, setTargetYear] = useState(MAX_YEAR);
  const [startYear, setStartYear] = useState(2026);

  const targetYearOptions = useMemo(
    () => YEARS.filter((r) => r.year > startYear).map((r) => r.year),
    [startYear],
  );

  const { k, elasticity, rows } = useMemo(
    () => solvePath(startYear, targetYear),
    [startYear, targetYear],
  );

  const finalRow = rows[rows.length - 1];
  const ppIncrease = k * CURRENT_COMBINED_RATE * 100;
  const annualStepPp = ppIncrease / (targetYear - (startYear - 1));
  const finalCombined = CURRENT_COMBINED_RATE * (1 + k) * 100;
  const finalPerSide = CURRENT_PER_SIDE_RATE * (1 + k) * 100;

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="eyebrow">PolicyEngine × CBO baseline</div>
          <h1>Payroll tax deficit explorer</h1>
          <p className="subtitle">
            A mechanical what-if: under a hypothetical in which federal payroll
            tax rates are the sole lever, what proportional rate path —
            phasing in linearly from {startYear} to {targetYear} — would fully
            offset CBO's projected primary deficit in {targetYear}? This is
            not a policy recommendation.
          </p>
        </div>
      </header>

      <main className="container main">
        <section className="controls card">
          <div className="control">
            <label htmlFor="start">Phase-in starts</label>
            <select
              id="start"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
            >
              {START_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label htmlFor="target">Primary deficit offset in</label>
            <select
              id="target"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
            >
              {targetYearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="results">
          <div className="card stat">
            <div className="stat-label">Combined rate in {targetYear}</div>
            <div className="stat-value">{finalCombined.toFixed(2)}%</div>
            <div className="stat-sub">
              Up from {(CURRENT_COMBINED_RATE * 100).toFixed(2)}% today (+
              {ppIncrease.toFixed(2)}pp)
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">Per-side rate (paystub)</div>
            <div className="stat-value">{finalPerSide.toFixed(2)}%</div>
            <div className="stat-sub">
              Up from {(CURRENT_PER_SIDE_RATE * 100).toFixed(2)}% today (+
              {(ppIncrease / 2).toFixed(2)}pp)
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">Annual step</div>
            <div className="stat-value">+{annualStepPp.toFixed(3)}pp</div>
            <div className="stat-sub">Added to combined rate each year</div>
          </div>
          <div className="card stat">
            <div className="stat-label">Extra revenue in {targetYear}</div>
            <div className="stat-value">
              {fmtBSigned(finalRow.reformPayrollB - finalRow.cboPayrollB)}
            </div>
            <div className="stat-sub">
              Equal to the {fmtB(finalRow.primaryDeficitB)} baseline primary
              deficit in {targetYear}
            </div>
          </div>
        </section>

        <section
          className="card chart-card"
          role="img"
          aria-label={`Combined payroll tax rate rises linearly from ${(CURRENT_COMBINED_RATE * 100).toFixed(2)} percent in ${startYear - 1} to ${finalCombined.toFixed(2)} percent in ${targetYear}.`}
        >
          <h2>Combined payroll tax rate</h2>
          <p className="caption">
            Linear ramp from {startYear} to {targetYear}, applied proportionally
            to OASDI (12.4% combined) and Medicare HI (2.9% combined) rates.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={rows}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" />
              <YAxis
                stroke="var(--muted-foreground)"
                domain={[
                  CURRENT_COMBINED_RATE * 100 - 0.8,
                  Math.ceil(finalCombined + 1),
                ]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => `${Number(v).toFixed(2)}%`}
                labelFormatter={(l) => `FY ${l}`}
              />
              <ReferenceLine
                y={CURRENT_COMBINED_RATE * 100}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: `Current ${(CURRENT_COMBINED_RATE * 100).toFixed(2)}%`,
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  position: "insideBottomRight",
                }}
              />
              <Line
                type="linear"
                dataKey="combinedRatePct"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--chart-1)" }}
                name="Reform combined rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section
          className="card chart-card"
          role="img"
          aria-label={`Side-by-side bar chart comparing baseline primary deficit to residual primary deficit after reform for each year from ${rows[0].year} to ${MAX_YEAR}. By construction, residual deficit equals zero in ${targetYear}.`}
        >
          <h2>Primary deficit, before and after reform</h2>
          <p className="caption">
            Reform extra revenue subtracted from CBO's projected primary
            deficit each year. By construction, reform revenue equals baseline
            primary deficit in {targetYear}.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={rows}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" />
              <YAxis
                stroke="var(--muted-foreground)"
                tickFormatter={(v) => `$${v}B`}
              />
              <Tooltip
                formatter={(v) => fmtB(Number(v))}
                labelFormatter={(l) => `FY ${l}`}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" />
              <Bar
                dataKey="primaryDeficitB"
                fill="var(--destructive)"
                name="Baseline primary deficit"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="primaryDeficitAfterB"
                fill="var(--chart-1)"
                name="Residual primary deficit"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section
          className="card chart-card"
          role="img"
          aria-label={`Payroll tax revenue, CBO baseline vs reform. In ${targetYear}, baseline is ${fmtB(finalRow.cboPayrollB)} and reform is ${fmtB(finalRow.reformPayrollB)}.`}
        >
          <h2>Payroll tax revenue, baseline vs reform</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={rows}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" />
              <YAxis
                stroke="var(--muted-foreground)"
                tickFormatter={(v) => `$${v}B`}
              />
              <Tooltip
                formatter={(v) => fmtB(Number(v))}
                labelFormatter={(l) => `FY ${l}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cboPayrollB"
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={2}
                name="CBO baseline payroll tax"
              />
              <Line
                type="monotone"
                dataKey="reformPayrollB"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--chart-1)" }}
                name="Reform payroll tax"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="card methodology">
          <h2>Methodology</h2>
          <ul>
            <li>
              <strong>Primary deficits and baseline payroll tax revenue</strong>{" "}
              from CBO's{" "}
              <a
                href="https://www.cbo.gov/publication/62105"
                target="_blank"
                rel="noreferrer"
              >
                Budget and Economic Outlook: 2026 to 2036
              </a>{" "}
              (Table 1-1, February 2026). Primary deficits exclude net outlays
              for interest; data range {MIN_YEAR}–{MAX_YEAR}.
            </li>
            <li>
              <strong>Revenue response to rate changes</strong> measured with{" "}
              <a
                href="https://policyengine.org/us"
                target="_blank"
                rel="noreferrer"
              >
                PolicyEngine-US
              </a>{" "}
              on the default national dataset (enhanced CPS, uprated). A sweep
              scales all four statutory rate parameters — OASDI employee and
              employer (6.2% each) and HI employee and employer (1.45% each) —
              by a common factor (1 + k) for k ∈ {"{0, 0.1, 0.2, 0.3, 0.4, 0.5}"}.
              The app fits an OLS slope through the origin, yielding an
              implied elasticity of{" "}
              <code>{elasticity.toFixed(4)}</code> — a 1% proportional rate
              increase yields ≈{(elasticity * 100).toFixed(2)}% more payroll
              revenue. The ≈6% shortfall reflects the OASDI wage-base cap
              (≈$194,400 in 2026), which exempts wages above the cap from the
              OASDI portion.
            </li>
            <li>
              <strong>Linear phase-in</strong>: extra revenue in year t equals
              k × progress(t) × elasticity × CBO baseline payroll revenue,
              where progress rises linearly from 0 in year {startYear} − 1 to
              1 in the target year. k is solved so that extra revenue exactly
              equals the baseline primary deficit in the target year.
            </li>
            <li>
              <strong>Assumptions held fixed</strong>: the OASDI wage-base cap
              is not changed — lifting or raising the cap is an alternative
              payroll-side lever not modeled here. Social Security and Medicare
              benefit formulas are not re-scored, so the reform does not feed
              back into program outlays. Net interest savings from lower debt
              accumulation are ignored, which biases the required rate path
              slightly upward.
            </li>
            <li>
              <strong>Static scoring.</strong> PolicyEngine's payroll-tax
              calculation is mechanical — no labor-supply response. A dynamic
              estimate including behavioral contraction would require a
              larger rate increase.
            </li>
            <li>
              <strong>Only the target year is closed.</strong> The linear ramp
              leaves positive residual primary deficits in intermediate years.
              Closing cumulative primary deficits over the whole window would
              require a steeper ramp or earlier phase-in.
            </li>
            <li>
              <strong>Elasticity extrapolation.</strong> The grid was fit at
              2036; the app applies the same elasticity to earlier years. The
              OASDI cap-bind share varies with the wage distribution over
              time, so year-specific elasticities would differ slightly.
            </li>
          </ul>
        </section>

        <footer className="footer">
          <p>
            Built with{" "}
            <a
              href="https://policyengine.org"
              target="_blank"
              rel="noreferrer"
            >
              PolicyEngine
            </a>
            . Source and replication code at{" "}
            <a
              href="https://github.com/PolicyEngine/payroll-deficit-explorer"
              target="_blank"
              rel="noreferrer"
            >
              github.com/PolicyEngine/payroll-deficit-explorer
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
