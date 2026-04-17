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
import { CURRENT_COMBINED_RATE, CURRENT_PER_SIDE_RATE } from "./data";
import { fmtB, fmtBSigned, solvePath } from "./model";
import "./App.css";

function App() {
  const [targetYear, setTargetYear] = useState(2036);
  const [startYear, setStartYear] = useState(2026);

  const { k, rows } = useMemo(
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
            How much would US payroll tax rates need to rise to eliminate the
            federal primary deficit by {targetYear}, with a linear phase-in
            starting in {startYear}?
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
              {[2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label htmlFor="target">Primary deficit eliminated by</label>
            <select
              id="target"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
            >
              {[2030, 2031, 2032, 2033, 2034, 2035, 2036]
                .filter((y) => y > startYear)
                .map((y) => (
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
            <div
              className="stat-value"
              style={{ color: "var(--primary)" }}
            >
              {finalCombined.toFixed(2)}%
            </div>
            <div className="stat-sub">
              Up from 15.30% today (+{ppIncrease.toFixed(2)}pp)
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">Per-side rate (paystub)</div>
            <div
              className="stat-value"
              style={{ color: "var(--primary)" }}
            >
              {finalPerSide.toFixed(2)}%
            </div>
            <div className="stat-sub">
              Up from 7.65% today (+{(ppIncrease / 2).toFixed(2)}pp)
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">Annual step</div>
            <div
              className="stat-value"
              style={{ color: "var(--primary)" }}
            >
              +{annualStepPp.toFixed(3)}pp
            </div>
            <div className="stat-sub">Added to combined rate each year</div>
          </div>
          <div className="card stat">
            <div className="stat-label">Extra revenue in {targetYear}</div>
            <div
              className="stat-value"
              style={{ color: "var(--primary)" }}
            >
              {fmtBSigned(finalRow.reformPayrollB - finalRow.baselinePayrollB)}
            </div>
            <div className="stat-sub">
              Offsetting the {fmtB(finalRow.primaryDeficitB)} primary deficit
            </div>
          </div>
        </section>

        <section className="card chart-card">
          <h2>Combined payroll tax rate</h2>
          <p className="caption">
            Linear ramp from {startYear} to {targetYear}, applied proportionally
            to OASDI (12.4%) and Medicare HI (2.9%) rates.
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
                domain={[14.5, Math.ceil(finalCombined + 1)]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => `${Number(v).toFixed(2)}%`}
                labelFormatter={(l) => `FY ${l}`}
              />
              <ReferenceLine
                y={15.3}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: "Current 15.3%",
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

        <section className="card chart-card">
          <h2>Primary deficit, before and after reform</h2>
          <p className="caption">
            Reform extra revenue subtracted from CBO's projected primary
            deficit. By construction, the deficit closes in {targetYear}.
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

        <section className="card chart-card">
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
                dataKey="baselinePayrollB"
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={2}
                name="Baseline payroll tax"
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
              <strong>Baseline deficits</strong> from CBO's{" "}
              <a
                href="https://www.cbo.gov/publication/62105"
                target="_blank"
                rel="noreferrer"
              >
                Budget and Economic Outlook: 2026 to 2036
              </a>{" "}
              (February 2026). Year-by-year primary-deficit decomposition read
              from CRFB's{" "}
              <a
                href="https://www.crfb.org/sites/default/files/media/documents/February_2026_CBO_Baseline_Webinar.pdf"
                target="_blank"
                rel="noreferrer"
              >
                February 2026 baseline webinar
              </a>
              .
            </li>
            <li>
              <strong>Baseline payroll tax revenue</strong> computed with{" "}
              <a
                href="https://policyengine.org/us"
                target="_blank"
                rel="noreferrer"
              >
                PolicyEngine-US
              </a>{" "}
              on the default national dataset (enhanced CPS, uprated).
              Total = <code>employee_payroll_tax</code> +{" "}
              <code>employer_payroll_tax</code> summed across households.
              Values ~9% below CBO totals, reflecting different microdata
              sources and calibration targets.
            </li>
            <li>
              <strong>Rate response</strong> from a PolicyEngine sweep scaling
              all four statutory rate parameters — OASDI employee and employer
              (6.2% each) and HI employee and employer (1.45% each) — by a
              common factor (1 + k). A 1% proportional rate increase yields a
              0.94% revenue increase; the ~6% shortfall reflects the OASDI
              wage-base cap (≈$194,400 in 2026), which exempts wages above the
              cap from the OASDI portion.
            </li>
            <li>
              <strong>Linear phase-in</strong>: extra revenue in year t equals
              k × progress(t) × elasticity × baseline payroll tax, where
              progress rises linearly from 0 in year {startYear} − 1 to 1 in
              the target year. k is solved so that extra revenue exactly
              equals the baseline primary deficit in the target year.
            </li>
            <li>
              <strong>Static scoring.</strong> PolicyEngine's payroll-tax
              calculation is mechanical — no labor-supply response. A dynamic
              estimate including behavioral contraction would require a larger
              rate increase (typically 15–25% larger, per CBO convention).
            </li>
            <li>
              <strong>Only the target year is closed.</strong> The linear ramp
              leaves positive residual primary deficits in intermediate years.
              Closing cumulative primary deficits over the whole window would
              require a steeper ramp or earlier phase-in.
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
