import { useId, type ReactNode } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

/**
 * Recharts animates every series in on mount. That is right on the site and
 * wrong for the PDF exporter, which screenshots each chart a moment after
 * rendering it and was catching pies and radars part-way through their sweep.
 *
 * The exporter renders into its own React root, sets this before rendering and
 * clears it afterwards, so the value is constant for the whole of any render
 * pass that reads it.
 */
/**
 * Motion is a common trigger for people with vestibular conditions and for some
 * trauma survivors, so a reader who has asked their system for less of it gets
 * static charts too. Recharts animates in JavaScript, so the CSS rule in
 * index.css cannot reach this; read the same media query here. The value is
 * sampled once per render pass rather than subscribed to — a chart already on
 * screen would not re-animate anyway.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let staticCharts = prefersReducedMotion();
let capturing = false;

/**
 * Switches the charts into the form the PDF exporter needs: no entry
 * animation, and no data disclosure.
 *
 * The disclosure is a screen-reader affordance for the website. In the book
 * the numbers are already on the page, and a "Show the numbers" line printed
 * under every figure would be nonsense.
 */
export function setChartCaptureMode(value: boolean) {
  capturing = value;
  // Clearing the exporter's flag returns to the reader's preference, not to on.
  staticCharts = value || prefersReducedMotion();
}

/**
 * The series colours, re-tuned for a book that will be printed in black.
 *
 * A colour interior caps at 600 pages on every print service worth using and
 * this book is past that, so the paperback is black ink whatever else gets
 * decided. On screen the figures separate by hue, which is right for a calm
 * page and useless once the colour is gone.
 *
 * Eight variables carry series identity here, which is the trap: `--primary`
 * and `--destructive` are used more often than most of the numbered ones, so
 * re-tuning only `--chart-N` moves some colours onto others. Measured together
 * the eight spanned 28% to 48% luminance with two of them 0.3 points apart, and
 * thirteen figures had a pair inside 8 points — three of those inside 1.5,
 * which is to say identical in grey.
 *
 * These keep every hue and saturation and move only lightness, putting the
 * eight on a ladder from 17% to 80% luminance, 8.6 points apart at the closest.
 * The lightness values are whole percents chosen against the luminance they
 * actually produce once rounded, because the stylesheet rounds them anyway and
 * a ladder solved in fractions lands short. `--muted-foreground` is deliberately left where it is: it is the
 * caption and subtitle colour as well as a series colour, and lightening it to
 * separate six charts washed out the text under every one of the hundred.
 *
 * Applied to the offscreen host at capture time rather than to the site, which
 * has colour and does not need this. The darkest is the one that means "bad",
 * so the ladder carries meaning rather than only separating.
 */
export const PRINT_CHART_PALETTE: Record<string, string> = {
  "--destructive": "0 72% 29%",
  "--chart-4": "340 62% 38%",
  "--primary": "210 65% 48%",
  "--chart-3": "158 62% 40%",
  "--chart-1": "212 68% 66%",
  "--chart-5": "265 52% 78%",
  "--chart-2": "27 82% 79%",
};/**
 * The shared frame every figure in the book sits in.
 *
 * Charts are `<figure>` rather than `<div>` so a screen reader announces them
 * as a single unit and can jump between them, and so the sourcing note is a
 * real `<figcaption>` tied to the figure rather than a loose paragraph that
 * happens to follow it.
 */
/**
 * Value labels on single-series bars. A reader should be able to take the
 * number off the chart without measuring it against a gridline, and the PDF
 * renders these too — where the tooltip is not available at all.
 */
const percentLabel = (value: unknown) => `${value}%`;
const plainLabel = (value: unknown) => `${value}`;

/** A row of a chart's source data: flat, one key per column. */
type ChartRow = Record<string, string | number | null | undefined>;

/**
 * Keys that carry presentation rather than data. Recharts takes per-slice
 * colours on the row itself, and a colour is not something to put in a table.
 */
const NON_DATA_KEYS = new Set(["fill", "color", "stroke"]);

/** `avoidancePct` -> `Avoidance Pct`, for a column with no configured label. */
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * The figure's data as a real table.
 *
 * Recharts renders into an SVG it marks `role="application"`, which is the
 * most hostile role in ARIA: it tells the screen reader to stop interpreting
 * the content and forward keystrokes to the widget. What a reader gets from
 * inside one is the `<text>` nodes in paint order — "0%", "15%", "30%",
 * "General Population", "Women", ..., "3.9%", "8%" — the categories and their
 * values in separate runs with nothing tying them together. On a radar or a
 * pie the values are not in the SVG at all, so the data is simply absent.
 *
 * So the drawing is marked decorative and this table is the figure's real
 * content. It is a `<details>` rather than visually-hidden text because the
 * numbers are worth having for everyone: this is a book largely made of
 * statistics, and a sighted reader who wants the exact figure behind a bar
 * currently has to hover it.
 */
function ChartDataTable({ title, data, config }: { title?: string; data: ChartRow[]; config?: ChartConfig }) {
  const keys = Array.from(new Set(data.flatMap((row) => Object.keys(row)))).filter(
    (key) => !NON_DATA_KEYS.has(key)
  );
  if (keys.length === 0 || data.length === 0) return null;

  return (
    <details className="mt-4 text-sm" data-chart-data>
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        Show the numbers
      </summary>
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse">
          {title ? <caption className="sr-only">{title}</caption> : null}
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key} scope="col" className="border-b py-1.5 pr-4 font-medium">
                  {config?.[key]?.label ?? humanizeKey(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {keys.map((key, j) => {
                  // A null is a deliberate gap in the series, not a zero.
                  const value = row[key] ?? "\u2014";
                  return j === 0 ? (
                    <th key={key} scope="row" className="border-b py-1.5 pr-4 font-normal">
                      {value}
                    </th>
                  ) : (
                    <td key={key} className="border-b py-1.5 pr-4 tabular-nums">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function ChartFrame({
  title,
  subtitle,
  source,
  data,
  config,
  description,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  source?: ReactNode;
  /**
   * The rows behind the drawing. Omitted by the hand-drawn diagrams, which
   * have no tabular data and carry their own `<title>` and `<desc>` instead.
   */
  data?: ChartRow[];
  config?: ChartConfig;
  /**
   * What the drawing says, for a figure whose meaning a table cannot carry —
   * a diagram whose proportions are illustrative rather than measured. Read to
   * a screen reader in place of the drawing.
   */
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  const hasTable = !!data && data.length > 0;
  const decorative = hasTable || !!description;
  return (
    /*
      The title labels the figure rather than heading a section. It was an
      `<h4>`, which put a heading-order skip under every `<h2>` in the book and
      buried the real outline under a hundred figure titles. Naming the
      `<figure>` instead keeps it announced — "figure, PTSD Prevalence by
      Population" — without pretending it is a section of the chapter.
    */
    <figure
      className="my-8 p-6 bg-card rounded-md border"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
    >
      <p id={`${id}-title`} data-chart-title className="text-lg font-semibold mb-2">
        {title}
      </p>
      {subtitle ? (
        <p data-chart-subtitle className="text-sm text-muted-foreground mb-4">
          {subtitle}
        </p>
      ) : null}
      {description ? (
        <p id={`${id}-desc`} className="sr-only">
          {description}
        </p>
      ) : null}
      {/*
        Once the table or the description is here the drawing repeats it, so it
        is not read out twice — and `role=application` cannot be removed from a
        Recharts surface, only hidden along with it. `inert` rather than
        `aria-hidden` alone because Recharts leaves the surface focusable, and
        hiding it from a screen reader while it still takes a Tab stop is a
        trap, not a fix.
      */}
      <div inert={decorative} aria-hidden={decorative || undefined}>
        {children}
      </div>
      {hasTable && !capturing ? (
        <ChartDataTable
          title={typeof title === "string" ? title : undefined}
          data={data}
          config={config}
        />
      ) : null}
      {source ? (
        <figcaption className="text-xs text-muted-foreground mt-3">
          {source}
        </figcaption>
      ) : null}
    </figure>
  );
}

const ptsdPrevalenceData = [
  { group: "General Population", prevalence: 3.9 },
  { group: "Women", prevalence: 8.0 },
  { group: "Men", prevalence: 4.0 },
  { group: "Veterans", prevalence: 7.0 },
  { group: "IPV Survivors", prevalence: 51.0 },
  { group: "Sexual Assault", prevalence: 33.0 },
];

const ptsdConfig: ChartConfig = {
  prevalence: {
    label: "PTSD Prevalence (%)",
    color: "hsl(var(--primary))",
  },
};

export function PTSDPrevalenceChart() {
  return (
    <ChartFrame
      data={ptsdPrevalenceData}
      config={ptsdConfig}
      title="PTSD Prevalence by Population"
      subtitle="Lifetime PTSD prevalence rates across different populations"
      source={
        <>
          Cross-national lifetime estimate from Koenen, K. C., et al. (2017). Posttraumatic
          stress disorder in the World Mental Health Surveys. <em>Psychological Medicine,
          47</em>(13), 2260–2274. Veteran and assault-survivor figures from the U.S.
          Department of Veterans Affairs National Center for PTSD. Rates vary widely by how
          PTSD is assessed.
        </>
      }
    >
      <ChartContainer config={ptsdConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={ptsdPrevalenceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="group" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="prevalence" fill="var(--color-prevalence)" radius={4}>
            <LabelList
              dataKey="prevalence"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const acesPrevalenceData = [
  { aces: "0 ACEs", percentage: 36.1 },
  { aces: "1 ACE", percentage: 23.5 },
  { aces: "2 ACEs", percentage: 13.0 },
  { aces: "3 ACEs", percentage: 10.1 },
  { aces: "4+ ACEs", percentage: 17.3 },
];

const acesConfig: ChartConfig = {
  percentage: {
    label: "Adults (%)",
    color: "hsl(var(--primary))",
  },
};

export function ACEsPrevalenceChart() {
  return (
    <ChartFrame
      data={acesPrevalenceData}
      config={acesConfig}
      title="Adverse Childhood Experiences (ACEs) Distribution"
      subtitle="Percentage of U.S. adults by number of ACEs experienced"
      source={
        <>
          Swedo, E. A., et al. (2023). Prevalence of adverse childhood experiences among U.S.
          adults — Behavioral Risk Factor Surveillance System, 2011–2020. <em>MMWR,
          72</em>(26), 707–715. Roughly two in three adults report at least one ACE.
        </>
      }
    >
      <ChartContainer config={acesConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={acesPrevalenceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="aces" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const recoveryTimelineData = [
  { months: "3 months", recovered: 20 },
  { months: "6 months", recovered: 27 },
  { months: "1 year", recovered: 40 },
  { months: "2 years", recovered: 50 },
  { months: "5 years", recovered: 65 },
  { months: "10 years", recovered: 77 },
];

const recoveryConfig: ChartConfig = {
  recovered: {
    label: "Recovered (%)",
    color: "hsl(var(--primary))",
  },
};

export function RecoveryTimelineChart() {
  return (
    <ChartFrame
      data={recoveryTimelineData}
      config={recoveryConfig}
      title="Natural PTSD Recovery Timeline"
      subtitle="Percentage of individuals who recover from PTSD over time"
      source={
        <>
          Course of remission after Kessler, R. C., et al. (1995). Posttraumatic stress
          disorder in the National Comorbidity Survey. <em>Archives of General Psychiatry,
          52</em>(12), 1048–1060. Roughly a third of cases persist for years, which is why "it
          should have passed by now" is bad advice.
        </>
      }
    >
      <ChartContainer config={recoveryConfig} className="h-[300px] w-full">
        <LineChart data={recoveryTimelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="months" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="recovered" stroke="var(--color-recovered)" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const traumaAddictionData = [
  { category: "Trauma Exposure in SUD", percentage: 90 },
  { category: "PTSD + SUD Comorbidity", percentage: 46 },
  { category: "Childhood Trauma + Addiction", percentage: 40 },
  { category: "Trauma Leading to SUD", percentage: 25 },
];

const addictionConfig: ChartConfig = {
  percentage: {
    label: "Percentage (%)",
    color: "hsl(var(--primary))",
  },
};

export function TraumaAddictionChart() {
  return (
    <ChartFrame
      data={traumaAddictionData}
      config={addictionConfig}
      title="Trauma-Addiction Connection"
      subtitle="Relationship between trauma exposure and substance use disorders"
      source={
        <>
          Khoury, L., et al. (2010). Substance use, childhood traumatic experience, and PTSD
          in an urban civilian population. <em>Depression and Anxiety, 27</em>(12), 1077–1086.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={addictionConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={traumaAddictionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="category" width={180} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const therapyEffectivenessData = [
  { therapy: "CBT", effectSize: 1.0, label: "Large" },
  { therapy: "TF-CBT", effectSize: 1.3, label: "Large" },
  { therapy: "DBT-PTSD", effectSize: 1.5, label: "Very Large" },
  { therapy: "EMDR", effectSize: 1.1, label: "Large" },
  { therapy: "CPT", effectSize: 0.8, label: "Large" },
  { therapy: "PE", effectSize: 0.9, label: "Large" },
];

const therapyConfig: ChartConfig = {
  effectSize: {
    label: "Effect Size (Cohen's d)",
    color: "hsl(var(--primary))",
  },
};

export function TherapyEffectivenessChart() {
  return (
    <ChartFrame
      data={therapyEffectivenessData}
      config={therapyConfig}
      title="Trauma Therapy Effectiveness"
      subtitle="Effect sizes (Cohen's d) for evidence-based trauma treatments"
      source={
        <>
          Pooled effects after Bisson, J. I., et al. (2013). Psychological therapies for
          chronic PTSD in adults. <em>Cochrane Database of Systematic Reviews</em>, CD003388,
          and Cusack, K., et al. (2016). <em>Clinical Psychology Review, 43</em>, 128–141.
          Effect size: 0.2 small, 0.5 medium, 0.8+ large. Figures shift with the comparator,
          so read the ranking rather than the decimal.
        </>
      }
    >
      <ChartContainer config={therapyConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={therapyEffectivenessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="therapy" />
          <YAxis domain={[0, 2]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="effectSize" fill="var(--color-effectSize)" radius={4}>
            <LabelList
              dataKey="effectSize"
              position="top"
              formatter={plainLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Recharts spreads each datum's own keys onto the rendered label element, so a
// field named "style" reaches the DOM as a string `style` prop and React throws,
// blanking every page that shows this chart. Keep data keys off DOM prop names.
const attachmentStylesData = [
  { attachmentStyle: "Secure", percentage: 60 },
  { attachmentStyle: "Avoidant", percentage: 15 },
  { attachmentStyle: "Anxious", percentage: 15 },
  { attachmentStyle: "Disorganized", percentage: 10 },
];

// Attachment styles are four unrelated categories, so they get four separate
// hues from the categorical palette. The previous set leaned on
// `muted-foreground` and `accent-foreground`, which are near-greys and read as
// "no data" rather than as a slice.
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const attachmentConfig: ChartConfig = {
  percentage: {
    label: "Population (%)",
    color: "hsl(var(--primary))",
  },
};

export function AttachmentStylesChart() {
  return (
    <ChartFrame
      data={attachmentStylesData}
      config={attachmentConfig}
      title="Attachment Style Distribution"
      subtitle="Population distribution of attachment patterns in general population"
      source={
        <>
          Distribution after Bakermans-Kranenburg, M. J., &amp; van IJzendoorn, M. H. (2009).
          The first 10,000 Adult Attachment Interviews. <em>Attachment &amp; Human
          Development, 11</em>(3), 223–263. Proportions differ between community and clinical
          samples.
        </>
      }
    >
      <ChartContainer config={attachmentConfig} className="h-[300px] w-full">
        <PieChart>
          <Pie isAnimationActive={!staticCharts}
            data={attachmentStylesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="percentage"
            nameKey="attachmentStyle"
          >
            {attachmentStylesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const acesHealthData = [
  { condition: "Alcoholism", risk4ACEs: 7.4, risk0ACEs: 1.0 },
  { condition: "Drug Abuse", risk4ACEs: 4.7, risk0ACEs: 1.0 },
  { condition: "Depression", risk4ACEs: 4.6, risk0ACEs: 1.0 },
  { condition: "Suicide Attempt", risk4ACEs: 12.2, risk0ACEs: 1.0 },
  { condition: "Smoking", risk4ACEs: 2.2, risk0ACEs: 1.0 },
  { condition: "Poor Health", risk4ACEs: 2.2, risk0ACEs: 1.0 },
];

const acesHealthConfig: ChartConfig = {
  risk4ACEs: {
    label: "4+ ACEs (Relative Risk)",
    color: "hsl(var(--destructive))",
  },
  risk0ACEs: {
    label: "0 ACEs (Baseline)",
    color: "hsl(var(--chart-1))",
  },
};

export function ACEsHealthRiskChart() {
  return (
    <ChartFrame
      data={acesHealthData}
      config={acesHealthConfig}
      title="ACEs and Health Risk Increase"
      subtitle="Relative risk increase for adults with 4+ ACEs vs 0 ACEs"
      source={
        <>
          Adjusted odds ratios from Felitti, V. J., et al. (1998). Relationship of childhood
          abuse and household dysfunction to many of the leading causes of death in adults.
          <em>American Journal of Preventive Medicine, 14</em>(4), 245–258. These are
          population associations, not a forecast for any one person.
        </>
      }
    >
      <ChartContainer config={acesHealthConfig} className="h-[300px] w-full">
        <BarChart data={acesHealthData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="condition" angle={-45} textAnchor="end" height={80} />
          <YAxis tickFormatter={(v) => `${v}x`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="risk0ACEs" fill="var(--color-risk0ACEs)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="risk4ACEs" fill="var(--color-risk4ACEs)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const ptgDomainsData = [
  { domain: "Personal Strength", fullMark: 100, value: 75 },
  { domain: "New Possibilities", fullMark: 100, value: 68 },
  { domain: "Relating to Others", fullMark: 100, value: 82 },
  { domain: "Appreciation of Life", fullMark: 100, value: 85 },
  { domain: "Spiritual Change", fullMark: 100, value: 60 },
];

const ptgConfig: ChartConfig = {
  value: {
    label: "Growth Reported (%)",
    color: "hsl(var(--primary))",
  },
};

export function PostTraumaticGrowthChart() {
  return (
    <ChartFrame
      data={ptgDomainsData}
      config={ptgConfig}
      title="Post-Traumatic Growth Domains"
      subtitle="Areas where trauma survivors commonly report positive growth"
      source={
        <>
          Domains from Tedeschi, R. G., &amp; Calhoun, L. G. (1996). The Posttraumatic Growth
          Inventory. <em>Journal of Traumatic Stress, 9</em>(3), 455–471. Growth is something
          some people report afterwards; it is not a reason the trauma happened, and not a
          target to be held to. Magnitudes are illustrative — they show the pattern clinicians
          describe, not measured values.
        </>
      }
    >
      <ChartContainer config={ptgConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ptgDomainsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" className="text-xs" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts} name="Growth" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.5} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const ipvPtsdData = [
  { category: "Physical IPV + PTSD", percentage: 51 },
  { category: "Sexual IPV + PTSD", percentage: 75 },
  { category: "Psychological IPV + PTSD", percentage: 63 },
  { category: "Complex PTSD in IPV", percentage: 42 },
];

const ipvConfig: ChartConfig = {
  percentage: {
    label: "PTSD Rate (%)",
    color: "hsl(var(--primary))",
  },
};

export function IPVPTSDChart() {
  return (
    <ChartFrame
      data={ipvPtsdData}
      config={ipvConfig}
      title="PTSD Rates in Intimate Partner Violence Survivors"
      subtitle="PTSD development rates by type of IPV exposure"
      source={
        <>
          Golding, J. M. (1999). Intimate partner violence as a risk factor for mental
          disorders: A meta-analysis. <em>Journal of Family Violence, 14</em>(2), 99–132.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={ipvConfig} className="h-[280px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={ipvPtsdData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" angle={-15} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const dbtSkillsData = [
  { skill: "Mindfulness", effectiveness: 78 },
  { skill: "Distress Tolerance", effectiveness: 82 },
  { skill: "Emotion Regulation", effectiveness: 85 },
  { skill: "Interpersonal Effectiveness", effectiveness: 76 },
];

const dbtConfig: ChartConfig = {
  effectiveness: {
    label: "Improvement (%)",
    color: "hsl(var(--primary))",
  },
};

export function DBTSkillsChart() {
  return (
    <ChartFrame
      data={dbtSkillsData}
      config={dbtConfig}
      title="DBT Skills Module Effectiveness"
      subtitle="Patient-reported improvement by DBT skill module"
      source={
        <>
          Modules after Linehan, M. M. (2015). <em>DBT Skills Training Manual</em> (2nd ed.).
          Guilford. Magnitudes are illustrative — they show the pattern clinicians describe,
          not measured values.
        </>
      }
    >
      <ChartContainer config={dbtConfig} className="h-[280px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={dbtSkillsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4}>
            <LabelList
              dataKey="effectiveness"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Physical Wellness Chart
const physicalWellnessData = [
  { week: "Week 1", exercise: 20, sleep: 45, nutrition: 35 },
  { week: "Week 2", exercise: 35, sleep: 55, nutrition: 45 },
  { week: "Week 3", exercise: 50, sleep: 65, nutrition: 55 },
  { week: "Week 4", exercise: 60, sleep: 72, nutrition: 65 },
  { week: "Month 2", exercise: 70, sleep: 78, nutrition: 72 },
  { week: "Month 3", exercise: 80, sleep: 85, nutrition: 80 },
];

const physicalConfig: ChartConfig = {
  exercise: {
    label: "Exercise (%)",
    color: "hsl(var(--chart-1))",
  },
  sleep: {
    label: "Sleep Quality (%)",
    color: "hsl(var(--chart-2))",
  },
  nutrition: {
    label: "Nutrition (%)",
    color: "hsl(var(--chart-3))",
  },
};

export function PhysicalWellnessChart() {
  return (
    <ChartFrame
      data={physicalWellnessData}
      config={physicalConfig}
      title="Physical Wellness Progress Over Time"
      subtitle="Expected improvement in physical health markers during trauma recovery"
      source={
        <>
          A composite trajectory, not a study. Recovery is not linear and these curves are
          smoother than any real week looks.
        </>
      }
    >
      <ChartContainer config={physicalConfig} className="h-[300px] w-full">
        <LineChart data={physicalWellnessData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="exercise" stroke="var(--color-exercise)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="sleep" stroke="var(--color-sleep)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="nutrition" stroke="var(--color-nutrition)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Exercise Impact on Mental Health
const exerciseImpactData = [
  { type: "No Exercise", depression: 100, anxiety: 100, ptsd: 100 },
  { type: "Light (1-2x/wk)", depression: 75, anxiety: 78, ptsd: 85 },
  { type: "Moderate (3-4x/wk)", depression: 55, anxiety: 58, ptsd: 65 },
  { type: "Regular (5+x/wk)", depression: 40, anxiety: 45, ptsd: 50 },
];

const exerciseConfig: ChartConfig = {
  depression: {
    label: "Depression Symptoms (%)",
    color: "hsl(var(--chart-1))",
  },
  anxiety: {
    label: "Anxiety Symptoms (%)",
    color: "hsl(var(--chart-2))",
  },
  ptsd: {
    label: "PTSD Symptoms (%)",
    color: "hsl(var(--chart-3))",
  },
};

export function ExerciseImpactChart() {
  return (
    <ChartFrame
      data={exerciseImpactData}
      config={exerciseConfig}
      title="Exercise Frequency and Mental Health Symptoms"
      subtitle="Relative symptom levels by exercise frequency"
      source={
        <>
          Direction of effect after Björkman, F., &amp; Ekblom, Ö. (2022). Physical exercise
          as treatment for PTSD. <em>Military Medicine, 187</em>(9–10), e1103–e1113.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={exerciseConfig} className="h-[300px] w-full">
        <BarChart data={exerciseImpactData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="depression" fill="var(--color-depression)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="anxiety" fill="var(--color-anxiety)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Four Pillars of Recovery
const fourPillarsData = [
  { pillar: "Physical", fullMark: 100, healthy: 85, recovering: 45, struggling: 20 },
  { pillar: "Emotional", fullMark: 100, healthy: 80, recovering: 40, struggling: 15 },
  { pillar: "Mental", fullMark: 100, healthy: 82, recovering: 42, struggling: 18 },
  { pillar: "Social", fullMark: 100, healthy: 78, recovering: 35, struggling: 12 },
];

const pillarsConfig: ChartConfig = {
  healthy: {
    label: "Healthy Baseline",
    color: "hsl(var(--chart-1))",
  },
  recovering: {
    label: "In Recovery",
    color: "hsl(var(--chart-2))",
  },
  struggling: {
    label: "Struggling",
    color: "hsl(var(--chart-3))",
  },
};

export function FourPillarsChart() {
  return (
    <ChartFrame
      data={fourPillarsData}
      config={pillarsConfig}
      title="The Four Pillars of Recovery"
      subtitle="Wellness levels across the four pillars at different stages of recovery"
      source={
        <>
          The four pillars are the author’s own framing of what treatment covered, not a
          validated instrument. The levels are illustrative.
        </>
      }
    >
      <ChartContainer config={pillarsConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={fourPillarsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pillar" className="text-sm" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts} name="Healthy" dataKey="healthy" stroke="var(--color-healthy)" fill="var(--color-healthy)" fillOpacity={0.3} />
          <Radar isAnimationActive={!staticCharts} name="Recovering" dataKey="recovering" stroke="var(--color-recovering)" fill="var(--color-recovering)" fillOpacity={0.3} />
          <Radar isAnimationActive={!staticCharts} name="Struggling" dataKey="struggling" stroke="var(--color-struggling)" fill="var(--color-struggling)" fillOpacity={0.3} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Emotional Regulation Progress
const emotionalRegulationData = [
  { stage: "Crisis", regulation: 15, awareness: 20, expression: 10 },
  { stage: "Stabilizing", regulation: 35, awareness: 45, expression: 30 },
  { stage: "Processing", regulation: 55, awareness: 65, expression: 50 },
  { stage: "Integration", regulation: 75, awareness: 80, expression: 70 },
  { stage: "Thriving", regulation: 88, awareness: 90, expression: 85 },
];

const emotionalConfig: ChartConfig = {
  regulation: {
    label: "Emotion Regulation (%)",
    color: "hsl(var(--chart-1))",
  },
  awareness: {
    label: "Emotional Awareness (%)",
    color: "hsl(var(--chart-2))",
  },
  expression: {
    label: "Healthy Expression (%)",
    color: "hsl(var(--chart-3))",
  },
};

export function EmotionalRegulationChart() {
  return (
    <ChartFrame
      data={emotionalRegulationData}
      config={emotionalConfig}
      title="Emotional Wellness Development Through Recovery"
      subtitle="Growth in emotional skills across recovery stages"
      source={
        <>
          A composite trajectory across recovery stages rather than a measured cohort.
        </>
      }
    >
      <ChartContainer config={emotionalConfig} className="h-[300px] w-full">
        <LineChart data={emotionalRegulationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="regulation" stroke="var(--color-regulation)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="awareness" stroke="var(--color-awareness)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="expression" stroke="var(--color-expression)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Mental Wellness Factors
const mentalWellnessData = [
  { factor: "Cognitive Flexibility", percentage: 72 },
  { factor: "Self-Awareness", percentage: 68 },
  { factor: "Problem Solving", percentage: 65 },
  { factor: "Stress Management", percentage: 70 },
  { factor: "Mindfulness", percentage: 75 },
  { factor: "Positive Self-Talk", percentage: 60 },
];

const mentalConfig: ChartConfig = {
  percentage: {
    label: "Improvement (%)",
    color: "hsl(var(--primary))",
  },
};

export function MentalWellnessChart() {
  return (
    <ChartFrame
      data={mentalWellnessData}
      config={mentalConfig}
      title="Mental Wellness Factors in Recovery"
      subtitle="Average improvement in mental wellness components after 12 weeks of treatment"
      source={
        <>
          Direction of effect after Hofmann, S. G., et al. (2012). The efficacy of cognitive
          behavioral therapy: A review of meta-analyses. <em>Cognitive Therapy and Research,
          36</em>(5), 427–440. Magnitudes are illustrative — they show the pattern clinicians
          describe, not measured values.
        </>
      }
    >
      <ChartContainer config={mentalConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={mentalWellnessData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="factor" width={140} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Social Connection Impact
const socialConnectionData = [
  { connection: "Isolated", recovery: 25, wellbeing: 20 },
  { connection: "1-2 Supports", recovery: 45, wellbeing: 40 },
  { connection: "3-5 Supports", recovery: 65, wellbeing: 62 },
  { connection: "6+ Supports", recovery: 82, wellbeing: 80 },
];

const socialConfig: ChartConfig = {
  recovery: {
    label: "Recovery Success (%)",
    color: "hsl(var(--chart-1))",
  },
  wellbeing: {
    label: "Overall Wellbeing (%)",
    color: "hsl(var(--chart-2))",
  },
};

export function SocialConnectionChart() {
  return (
    <ChartFrame
      data={socialConnectionData}
      config={socialConfig}
      title="Social Connection and Recovery Outcomes"
      subtitle="Relationship between social support network size and recovery success"
      source={
        <>
          Direction of effect after Holt-Lunstad, J., Smith, T. B., &amp; Layton, J. B.
          (2010). Social relationships and mortality risk. <em>PLoS Medicine, 7</em>(7),
          e1000316. Magnitudes are illustrative — they show the pattern clinicians describe,
          not measured values.
        </>
      }
    >
      <ChartContainer config={socialConfig} className="h-[300px] w-full">
        <BarChart data={socialConnectionData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="connection" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="recovery" fill="var(--color-recovery)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="wellbeing" fill="var(--color-wellbeing)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Nutrition Impact on Mental Health
const nutritionImpactData = [
  { nutrient: "Omega-3s", moodImprovement: 35, anxietyReduction: 28 },
  { nutrient: "B Vitamins", moodImprovement: 25, anxietyReduction: 20 },
  { nutrient: "Vitamin D", moodImprovement: 30, anxietyReduction: 22 },
  { nutrient: "Magnesium", moodImprovement: 28, anxietyReduction: 32 },
  { nutrient: "Probiotics", moodImprovement: 22, anxietyReduction: 25 },
];

const nutritionConfig: ChartConfig = {
  moodImprovement: {
    label: "Mood Improvement (%)",
    color: "hsl(var(--chart-1))",
  },
  anxietyReduction: {
    label: "Anxiety Reduction (%)",
    color: "hsl(var(--chart-2))",
  },
};

export function NutritionImpactChart() {
  return (
    <ChartFrame
      data={nutritionImpactData}
      config={nutritionConfig}
      title="Key Nutrients and Mental Health Benefits"
      subtitle="Research-supported nutritional interventions for mental health"
      source={
        <>
          Direction of effect after Jacka, F. N., et al. (2017). A randomised controlled trial
          of dietary improvement for adults with major depression (the SMILES trial). <em>BMC
          Medicine, 15</em>, 23. Magnitudes are illustrative — they show the pattern
          clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={nutritionConfig} className="h-[300px] w-full">
        <BarChart data={nutritionImpactData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nutrient" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="moodImprovement" fill="var(--color-moodImprovement)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="anxietyReduction" fill="var(--color-anxietyReduction)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Sleep Quality and Recovery
const sleepRecoveryData = [
  { hours: "<5 hrs", ptsdSeverity: 85, recoveryRate: 20 },
  { hours: "5-6 hrs", ptsdSeverity: 70, recoveryRate: 35 },
  { hours: "6-7 hrs", ptsdSeverity: 55, recoveryRate: 55 },
  { hours: "7-8 hrs", ptsdSeverity: 35, recoveryRate: 75 },
  { hours: "8+ hrs", ptsdSeverity: 30, recoveryRate: 80 },
];

const sleepConfig: ChartConfig = {
  ptsdSeverity: {
    label: "PTSD Symptom Severity (%)",
    color: "hsl(var(--destructive))",
  },
  recoveryRate: {
    label: "Recovery Progress (%)",
    color: "hsl(var(--chart-1))",
  },
};

export function SleepRecoveryChart() {
  return (
    <ChartFrame
      data={sleepRecoveryData}
      config={sleepConfig}
      title="Sleep Duration and Trauma Recovery"
      subtitle="Relationship between sleep hours and PTSD symptoms/recovery"
      source={
        <>
          The relationship between short sleep and PTSD severity is well established; the
          curve here is illustrative rather than fitted to a dataset.
        </>
      }
    >
      <ChartContainer config={sleepConfig} className="h-[300px] w-full">
        <BarChart data={sleepRecoveryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hours" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="ptsdSeverity" fill="var(--color-ptsdSeverity)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="recoveryRate" fill="var(--color-recoveryRate)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Neuroscience Chapter Charts

// Amygdala Activity in PTSD
const amygdalaActivityData = [
  { condition: "Control", activity: 35 },
  { condition: "Trauma Reminder", activity: 82 },
  { condition: "After EMDR", activity: 48 },
  { condition: "After CBT", activity: 45 },
];

const amygdalaConfig: ChartConfig = {
  activity: {
    label: "Amygdala Activity (%)",
    color: "hsl(var(--destructive))",
  },
};

export function AmygdalaActivityChart() {
  return (
    <ChartFrame
      data={amygdalaActivityData}
      config={amygdalaConfig}
      title="Amygdala Hyperactivity in PTSD"
      subtitle="Amygdala activation levels during trauma reminders vs. baseline and after treatment"
      source={
        <>
          Shin, L. M., &amp; Liberzon, I. (2010). The neurocircuitry of fear, stress, and
          anxiety disorders. <em>Neuropsychopharmacology, 35</em>(1), 169–191. Magnitudes are
          illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={amygdalaConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={amygdalaActivityData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="condition" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="activity" fill="var(--color-activity)" radius={4}>
            <LabelList
              dataKey="activity"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Brain Regions Affected by Trauma
const brainRegionsData = [
  { region: "Amygdala", effect: "Hyperactive", change: 45 },
  { region: "Hippocampus", effect: "Volume Loss", change: -18 },
  { region: "Prefrontal Cortex", effect: "Underactive", change: -25 },
  { region: "Insula", effect: "Dysregulated", change: 30 },
];

const brainRegionsConfig: ChartConfig = {
  change: {
    label: "% Change from Baseline",
    color: "hsl(var(--primary))",
  },
};

export function BrainRegionsTraumaChart() {
  return (
    <ChartFrame
      data={brainRegionsData}
      config={brainRegionsConfig}
      title="Brain Region Changes in PTSD"
      subtitle="Percentage change in activity/volume compared to non-traumatized controls"
      source={
        <>
          Directions of change after Bremner, J. D. (2006). Traumatic stress: effects on the
          brain. <em>Dialogues in Clinical Neuroscience, 8</em>(4), 445–461, and van der Kolk,
          B. (2014). <em>The Body Keeps the Score</em>. Viking. Magnitudes are illustrative —
          they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={brainRegionsConfig} className="h-[300px] w-full">
        <BarChart data={brainRegionsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[-30, 50]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="region" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="change" fill="var(--color-change)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Neurotransmitter Levels in Trauma
const neurotransmitterData = [
  { chemical: "Dopamine", normal: 100, ptsd: 68 },
  { chemical: "Serotonin", normal: 100, ptsd: 69 },
  { chemical: "GABA", normal: 100, ptsd: 72 },
  { chemical: "Norepinephrine", normal: 100, ptsd: 145 },
  { chemical: "Cortisol (baseline)", normal: 100, ptsd: 78 },
];

const neurotransmitterConfig: ChartConfig = {
  normal: {
    label: "Normal Levels (%)",
    color: "hsl(var(--chart-1))",
  },
  ptsd: {
    label: "PTSD Levels (%)",
    color: "hsl(var(--destructive))",
  },
};

export function NeurotransmitterLevelsChart() {
  return (
    <ChartFrame
      data={neurotransmitterData}
      config={neurotransmitterConfig}
      title="Neurotransmitter Levels: Normal vs. PTSD"
      subtitle="Comparison of neurochemical levels (100% = healthy baseline)"
      source={
        <>
          Sherin, J. E., &amp; Nemeroff, C. B. (2011). Post-traumatic stress disorder: the
          neurobiological impact of psychological trauma. <em>Dialogues in Clinical
          Neuroscience, 13</em>(3), 263–278. Magnitudes are illustrative — they show the
          pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={neurotransmitterConfig} className="h-[300px] w-full">
        <BarChart data={neurotransmitterData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="chemical" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 160]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="normal" fill="var(--color-normal)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Cortisol Pattern
const cortisolPatternData = [
  { time: "6 AM", normal: 18, ptsd: 12 },
  { time: "9 AM", normal: 15, ptsd: 14 },
  { time: "12 PM", normal: 10, ptsd: 12 },
  { time: "3 PM", normal: 8, ptsd: 11 },
  { time: "6 PM", normal: 6, ptsd: 10 },
  { time: "9 PM", normal: 4, ptsd: 9 },
  { time: "12 AM", normal: 3, ptsd: 8 },
];

const cortisolConfig: ChartConfig = {
  normal: {
    label: "Normal Pattern",
    color: "hsl(var(--chart-1))",
  },
  ptsd: {
    label: "PTSD Pattern",
    color: "hsl(var(--destructive))",
  },
};

export function CortisolPatternChart() {
  return (
    <ChartFrame
      data={cortisolPatternData}
      config={cortisolConfig}
      title="Daily Cortisol Patterns"
      subtitle="Normal vs. PTSD cortisol rhythms throughout the day"
      source={
        <>
          Yehuda, R. (2002). Post-traumatic stress disorder. <em>New England Journal of
          Medicine, 346</em>(2), 108–114. The flattened curve — not simply a higher or lower
          one — is the finding.
        </>
      }
    >
      <ChartContainer config={cortisolConfig} className="h-[300px] w-full">
        <LineChart data={cortisolPatternData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Cortisol (mcg/dL)', angle: -90, position: 'insideLeft' }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="normal" stroke="var(--color-normal)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="ptsd" stroke="var(--color-ptsd)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Polyvagal States Chart
const polyvagalStatesData = [
  { state: "Ventral Vagal", safetyLevel: 90, socialEngagement: 85, energyLevel: 70 },
  { state: "Sympathetic", safetyLevel: 30, socialEngagement: 25, energyLevel: 95 },
  { state: "Dorsal Vagal", safetyLevel: 10, socialEngagement: 5, energyLevel: 15 },
];

const polyvagalConfig: ChartConfig = {
  safetyLevel: {
    label: "Sense of Safety",
    color: "hsl(var(--chart-1))",
  },
  socialEngagement: {
    label: "Social Engagement",
    color: "hsl(var(--chart-2))",
  },
  energyLevel: {
    label: "Energy Level",
    color: "hsl(var(--destructive))",
  },
};

export function PolyvagalStatesChart() {
  return (
    <ChartFrame
      data={polyvagalStatesData}
      config={polyvagalConfig}
      title="Polyvagal Theory: The Three States"
      subtitle="Characteristics of each autonomic nervous system state"
      source={
        <>
          Porges, S. W. (2011). <em>The Polyvagal Theory</em>. Norton. Polyvagal theory is a
          model of autonomic states, and parts of it remain contested; the three states are
          useful as a map of what the body is doing, not as settled anatomy.
        </>
      }
    >
      <ChartContainer config={polyvagalConfig} className="h-[300px] w-full">
        <BarChart data={polyvagalStatesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="state" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="safetyLevel" fill="var(--color-safetyLevel)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="socialEngagement" fill="var(--color-socialEngagement)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="energyLevel" fill="var(--color-energyLevel)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// PTSD Symptoms Distribution
const ptsdSymptomsData = [
  { category: "Intrusion", value: 85 },
  { category: "Avoidance", value: 78 },
  { category: "Negative Cognitions", value: 72 },
  { category: "Hyperarousal", value: 88 },
];

const ptsdSymptomsConfig: ChartConfig = {
  value: {
    label: "Prevalence (%)",
    color: "hsl(var(--primary))",
  },
};

export function PTSDSymptomsChart() {
  return (
    <ChartFrame
      data={ptsdSymptomsData}
      config={ptsdSymptomsConfig}
      title="PTSD Symptom Clusters"
      subtitle="Prevalence of each symptom cluster in PTSD patients"
      source={
        <>
          Clusters as defined in the American Psychiatric Association (2013). <em>Diagnostic
          and Statistical Manual of Mental Disorders</em> (5th ed.). The four clusters are
          diagnostic criteria; the proportions shown are illustrative.
        </>
      }
    >
      <ChartContainer config={ptsdSymptomsConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={ptsdSymptomsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="value" fill="var(--color-value)" radius={4}>
            <LabelList
              dataKey="value"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Complex PTSD Additional Symptoms
const complexPTSDData = [
  { symptom: "Affective Dysregulation", cptsd: 92, ptsd: 45 },
  { symptom: "Negative Self-Concept", cptsd: 88, ptsd: 55 },
  { symptom: "Relationship Difficulties", cptsd: 85, ptsd: 40 },
];

const complexPTSDConfig: ChartConfig = {
  cptsd: {
    label: "Complex PTSD (%)",
    color: "hsl(var(--destructive))",
  },
  ptsd: {
    label: "Standard PTSD (%)",
    color: "hsl(var(--chart-1))",
  },
};

export function ComplexPTSDChart() {
  return (
    <ChartFrame
      data={complexPTSDData}
      config={complexPTSDConfig}
      title="Complex PTSD vs. Standard PTSD"
      subtitle="Disturbances in Self-Organization (DSO) symptoms"
      source={
        <>
          Disturbances in self-organization as defined in ICD-11 6B41, following Cloitre, M.,
          et al. (2018). The International Trauma Questionnaire. <em>Acta Psychiatrica
          Scandinavica, 138</em>(6), 536–546. Magnitudes are illustrative — they show the
          pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={complexPTSDConfig} className="h-[300px] w-full">
        <BarChart data={complexPTSDData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="symptom" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="cptsd" fill="var(--color-cptsd)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Brain Healing with Treatment
const brainHealingData = [
  { measure: "Hippocampal Volume", before: 82, after: 95 },
  { measure: "PFC Activity", before: 65, after: 88 },
  { measure: "Amygdala Reactivity", before: 145, after: 108 },
  { measure: "HRV (Vagal Tone)", before: 68, after: 92 },
];

const brainHealingConfig: ChartConfig = {
  before: {
    label: "Before Treatment",
    color: "hsl(var(--destructive))",
  },
  after: {
    label: "After Treatment",
    color: "hsl(var(--chart-1))",
  },
};

export function BrainHealingChart() {
  return (
    <ChartFrame
      data={brainHealingData}
      config={brainHealingConfig}
      title="Brain Changes with Trauma Treatment"
      subtitle="Neurological measures before and after evidence-based trauma therapy (100% = healthy baseline)"
      source={
        <>
          Directions of change after Thomaes, K., et al. (2014). Can pharmacological and
          psychological treatment change brain structure and function in PTSD? <em>Journal of
          Psychiatric Research, 50</em>, 1–15. Magnitudes are illustrative — they show the
          pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={brainHealingConfig} className="h-[300px] w-full">
        <BarChart data={brainHealingData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="measure" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 160]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="before" fill="var(--color-before)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="after" fill="var(--color-after)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// ACT Hexaflex Chart
const actHexaflexData = [
  { process: "Present Moment", importance: 85, fullMark: 100 },
  { process: "Acceptance", importance: 80, fullMark: 100 },
  { process: "Defusion", importance: 78, fullMark: 100 },
  { process: "Self-as-Context", importance: 75, fullMark: 100 },
  { process: "Values", importance: 90, fullMark: 100 },
  { process: "Committed Action", importance: 88, fullMark: 100 },
];

const actHexaflexConfig: ChartConfig = {
  importance: {
    label: "Core Process Strength (%)",
    color: "hsl(var(--primary))",
  },
};

export function ACTHexaflexChart() {
  return (
    <ChartFrame
      data={actHexaflexData}
      config={actHexaflexConfig}
      title="The ACT Hexaflex: Six Core Processes"
      subtitle="Psychological flexibility develops through strengthening all six interconnected processes"
      source={
        <>
          Hayes, S. C., Strosahl, K. D., &amp; Wilson, K. G. (2012). <em>Acceptance and
          Commitment Therapy</em> (2nd ed.). Guilford. Magnitudes are illustrative — they show
          the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={actHexaflexConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={actHexaflexData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="process" className="text-xs" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts} name="Process Strength" dataKey="importance" stroke="var(--color-importance)" fill="var(--color-importance)" fillOpacity={0.5} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Family Dysfunction Patterns Chart
const familyDysfunctionData = [
  { pattern: "Enmeshment", prevalence: 35 },
  { pattern: "Disengagement", prevalence: 28 },
  { pattern: "Triangulation", prevalence: 42 },
  { pattern: "Parentification", prevalence: 31 },
  { pattern: "Scapegoating", prevalence: 25 },
  { pattern: "Denial", prevalence: 48 },
];

const familyDysfunctionConfig: ChartConfig = {
  prevalence: {
    label: "Prevalence (%)",
    color: "hsl(var(--primary))",
  },
};

export function FamilyDysfunctionChart() {
  return (
    <ChartFrame
      data={familyDysfunctionData}
      config={familyDysfunctionConfig}
      title="Common Dysfunctional Family Patterns"
      subtitle="Prevalence of dysfunctional patterns in families with identified dysfunction"
      source={
        <>
          Patterns after Bowen, M. (1978). <em>Family Therapy in Clinical Practice</em>. Jason
          Aronson, and Black, C. (1981). <em>It Will Never Happen to Me</em>. Magnitudes are
          illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={familyDysfunctionConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={familyDysfunctionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="pattern" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="prevalence" fill="var(--color-prevalence)" radius={4}>
            <LabelList
              dataKey="prevalence"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Childhood Trauma Timeline Chart
const childhoodTraumaTimelineData = [
  { age: "0-2 years", impact: 95, description: "Attachment formation" },
  { age: "3-5 years", impact: 88, description: "Brain development" },
  { age: "6-10 years", impact: 75, description: "Social development" },
  { age: "11-14 years", impact: 70, description: "Identity formation" },
  { age: "15-18 years", impact: 65, description: "Independence" },
];

const childhoodTimelineConfig: ChartConfig = {
  impact: {
    label: "Developmental Impact (%)",
    color: "hsl(var(--destructive))",
  },
};

export function ChildhoodTraumaTimelineChart() {
  return (
    <ChartFrame
      data={childhoodTraumaTimelineData}
      config={childhoodTimelineConfig}
      title="Trauma Impact by Developmental Stage"
      subtitle="Earlier trauma during critical periods has greater developmental impact"
      source={
        <>
          Perry, B. D. (2009). Examining child maltreatment through a neurodevelopmental lens.
          <em>Journal of Loss and Trauma, 14</em>(4), 240–255. Magnitudes are illustrative —
          they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={childhoodTimelineConfig} className="h-[300px] w-full">
        <LineChart data={childhoodTraumaTimelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="impact" stroke="var(--color-impact)" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Relationship Safety Assessment Chart
const relationshipSafetyData = [
  { indicator: "Physical Safety", healthy: 95, concerning: 40, dangerous: 10 },
  { indicator: "Emotional Safety", healthy: 90, concerning: 35, dangerous: 15 },
  { indicator: "Financial Freedom", healthy: 88, concerning: 45, dangerous: 20 },
  { indicator: "Social Connection", healthy: 85, concerning: 30, dangerous: 10 },
  { indicator: "Autonomy", healthy: 92, concerning: 38, dangerous: 12 },
];

const relationshipSafetyConfig: ChartConfig = {
  healthy: {
    label: "Healthy Relationship",
    color: "hsl(var(--chart-1))",
  },
  concerning: {
    label: "Concerning Signs",
    color: "hsl(var(--chart-2))",
  },
  dangerous: {
    label: "Dangerous",
    color: "hsl(var(--destructive))",
  },
};

export function RelationshipSafetyChart() {
  return (
    <ChartFrame
      data={relationshipSafetyData}
      config={relationshipSafetyConfig}
      title="Relationship Safety Indicators"
      subtitle="Comparison of safety indicators across relationship health levels"
      source={
        <>
          Indicators after the National Domestic Violence Hotline and the Duluth Power and
          Control Wheel. Magnitudes are illustrative — they show the pattern clinicians
          describe, not measured values. If any of the unsafe column is familiar, the U.S.
          hotline is 1-800-799-7233.
        </>
      }
    >
      <ChartContainer config={relationshipSafetyConfig} className="h-[300px] w-full">
        <BarChart data={relationshipSafetyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="indicator" angle={-15} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="concerning" fill="var(--color-concerning)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="dangerous" fill="var(--color-dangerous)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Window of Tolerance
const windowToleranceData = [
  { state: "Hyperarousal Zone", intensity: 90, optimal: 0 },
  { state: "Window of Tolerance", intensity: 0, optimal: 70 },
  { state: "Hypoarousal Zone", intensity: 85, optimal: 0 },
];

const windowToleranceConfig: ChartConfig = {
  intensity: {
    label: "Dysregulation Intensity",
    color: "hsl(var(--destructive))",
  },
  optimal: {
    label: "Optimal Functioning",
    color: "hsl(var(--chart-1))",
  },
};

export function WindowToleranceChart() {
  return (
    <ChartFrame
      data={windowToleranceData}
      config={windowToleranceConfig}
      title="The Window of Tolerance"
      subtitle="Arousal states and optimal functioning zones"
      source={
        <>
          Siegel, D. J. (1999). <em>The Developing Mind</em>. Guilford. The window widens with
          practice; its edges are not fixed.
        </>
      }
    >
      <ChartContainer config={windowToleranceConfig} className="h-[300px] w-full">
        <BarChart data={windowToleranceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="state" width={140} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="intensity" fill="var(--color-intensity)" radius={4} stackId="a" />
          <Bar isAnimationActive={!staticCharts} dataKey="optimal" fill="var(--color-optimal)" radius={4} stackId="a" />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Adult Trauma Types Chart
const adultTraumaTypesData = [
  { type: "Motor Vehicle Accidents", prevalence: 23 },
  { type: "Sudden Unexpected Death", prevalence: 21 },
  { type: "Sexual Assault", prevalence: 18 },
  { type: "Natural Disasters", prevalence: 15 },
  { type: "Physical Assault", prevalence: 14 },
  { type: "Combat/War", prevalence: 12 },
  { type: "Medical Trauma", prevalence: 11 },
  { type: "Workplace Violence", prevalence: 8 },
];

const adultTraumaTypesConfig: ChartConfig = {
  prevalence: {
    label: "Prevalence (%)",
    color: "hsl(var(--primary))",
  },
};

export function AdultTraumaTypesChart() {
  return (
    <ChartFrame
      data={adultTraumaTypesData}
      config={adultTraumaTypesConfig}
      title="Common Types of Adult Trauma"
      subtitle="Prevalence of different trauma types in adult populations"
      source={
        <>
          Categories after SAMHSA (2014). <em>SAMHSA’s Concept of Trauma and Guidance for a
          Trauma-Informed Approach</em> (HHS Publication No. SMA 14-4884). Magnitudes are
          illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={adultTraumaTypesConfig} className="h-[350px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={adultTraumaTypesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 30]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="type" width={160} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="prevalence" fill="var(--color-prevalence)" radius={4}>
            <LabelList
              dataKey="prevalence"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Grounding Techniques Effectiveness Chart
const groundingTechniquesData = [
  { technique: "5-4-3-2-1 Senses", effectiveness: 85 },
  { technique: "Deep Breathing", effectiveness: 82 },
  { technique: "Progressive Muscle Relaxation", effectiveness: 78 },
  { technique: "Cold Water/Ice", effectiveness: 75 },
  { technique: "Physical Movement", effectiveness: 80 },
  { technique: "Naming Objects", effectiveness: 70 },
];

const groundingTechniquesConfig: ChartConfig = {
  effectiveness: {
    label: "Effectiveness Rating",
    color: "hsl(var(--primary))",
  },
};

export function GroundingTechniquesChart() {
  return (
    <ChartFrame
      data={groundingTechniquesData}
      config={groundingTechniquesConfig}
      title="Grounding Techniques Effectiveness"
      subtitle="Effectiveness ratings for common grounding techniques"
      source={
        <>
          Effectiveness ratings here are illustrative. Which technique works is highly
          individual — the useful one is the one you will actually reach for at 3 a.m.
        </>
      }
    >
      <ChartContainer config={groundingTechniquesConfig} className="h-[300px] w-full">
        <RadarChart data={groundingTechniquesData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="technique" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts}
            name="Effectiveness"
            dataKey="effectiveness"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Coping Strategies Chart
const copingStrategiesData = [
  { strategy: "Social Support", healthy: 85, avoidant: 10 },
  { strategy: "Exercise", healthy: 80, avoidant: 5 },
  { strategy: "Therapy", healthy: 90, avoidant: 5 },
  { strategy: "Mindfulness", healthy: 75, avoidant: 8 },
  { strategy: "Substance Use", healthy: 5, avoidant: 85 },
  { strategy: "Isolation", healthy: 10, avoidant: 75 },
  { strategy: "Overwork", healthy: 15, avoidant: 70 },
];

const copingStrategiesConfig: ChartConfig = {
  healthy: {
    label: "Adaptive (%)",
    color: "hsl(var(--chart-1))",
  },
  avoidant: {
    label: "Maladaptive (%)",
    color: "hsl(var(--destructive))",
  },
};

export function CopingStrategiesChart() {
  return (
    <ChartFrame
      data={copingStrategiesData}
      config={copingStrategiesConfig}
      title="Coping Strategies: Adaptive vs. Maladaptive"
      subtitle="Comparison of healthy and unhealthy coping mechanisms"
      source={
        <>
          Adaptive/maladaptive framing after Lazarus, R. S., &amp; Folkman, S. (1984).
          <em>Stress, Appraisal, and Coping</em>. Springer. Magnitudes are illustrative — they
          show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={copingStrategiesConfig} className="h-[300px] w-full">
        <BarChart data={copingStrategiesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="avoidant" fill="var(--color-avoidant)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Resilience Factors Chart
const resilienceFactorsData = [
  { factor: "Social Support", score: 90 },
  { factor: "Self-Efficacy", score: 85 },
  { factor: "Optimism", score: 80 },
  { factor: "Emotional Regulation", score: 82 },
  { factor: "Problem-Solving", score: 78 },
  { factor: "Purpose/Meaning", score: 88 },
];

const resilienceFactorsConfig: ChartConfig = {
  score: {
    label: "Protective Value",
    color: "hsl(var(--primary))",
  },
};

export function ResilienceFactorsChart() {
  return (
    <ChartFrame
      data={resilienceFactorsData}
      config={resilienceFactorsConfig}
      title="Key Resilience Factors"
      subtitle="Factors that contribute to post-trauma resilience"
      source={
        <>
          Factors after Southwick, S. M., &amp; Charney, D. S. (2018). <em>Resilience: The
          Science of Mastering Life’s Greatest Challenges</em> (2nd ed.). Cambridge University
          Press. Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={resilienceFactorsConfig} className="h-[300px] w-full">
        <RadarChart data={resilienceFactorsData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts}
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Spiritual Practices Chart
const spiritualPracticesData = [
  { practice: "Meditation", benefit: 85, adoption: 45 },
  { practice: "Prayer", benefit: 80, adoption: 62 },
  { practice: "Nature Connection", benefit: 78, adoption: 55 },
  { practice: "Gratitude Practice", benefit: 82, adoption: 40 },
  { practice: "Service to Others", benefit: 88, adoption: 35 },
  { practice: "Mindful Movement", benefit: 75, adoption: 30 },
];

const spiritualPracticesConfig: ChartConfig = {
  benefit: {
    label: "Reported Benefit (%)",
    color: "hsl(var(--chart-1))",
  },
  adoption: {
    label: "Adoption Rate (%)",
    color: "hsl(var(--chart-2))",
  },
};

export function SpiritualPracticesChart() {
  return (
    <ChartFrame
      data={spiritualPracticesData}
      config={spiritualPracticesConfig}
      title="Spiritual Practices in Recovery"
      subtitle="Benefits and adoption rates of spiritual practices"
      source={
        <>
          Adoption and benefit figures are illustrative. The evidence base for spiritual
          practice in recovery is mostly about meaning and belonging rather than any
          particular practice.
        </>
      }
    >
      <ChartContainer config={spiritualPracticesConfig} className="h-[300px] w-full">
        <BarChart data={spiritualPracticesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="practice" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="benefit" fill="var(--color-benefit)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="adoption" fill="var(--color-adoption)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Recovery Values Wheel Chart
const recoveryValuesData = [
  { value: "Connection", importance: 92 },
  { value: "Authenticity", importance: 85 },
  { value: "Growth", importance: 88 },
  { value: "Peace", importance: 90 },
  { value: "Purpose", importance: 87 },
  { value: "Self-Compassion", importance: 93 },
  { value: "Courage", importance: 82 },
  { value: "Gratitude", importance: 84 },
];

const recoveryValuesConfig: ChartConfig = {
  importance: {
    label: "Importance Rating",
    color: "hsl(var(--primary))",
  },
};

export function RecoveryValuesChart() {
  return (
    <ChartFrame
      data={recoveryValuesData}
      config={recoveryValuesConfig}
      title="Core Values in Recovery"
      subtitle="Values commonly prioritized by those in trauma recovery"
      source={
        <>
          Values domains after Wilson, K. G., et al. (2010). The Valued Living Questionnaire.
          <em>The Psychological Record, 60</em>(2), 249–272. Magnitudes are illustrative —
          they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={recoveryValuesConfig} className="h-[300px] w-full">
        <RadarChart data={recoveryValuesData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="value" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts}
            name="Importance"
            dataKey="importance"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Treatment Modalities Comparison Chart
const treatmentModalitiesData = [
  { modality: "CPT", ptsd: 85, depression: 70, anxiety: 65 },
  { modality: "EMDR", ptsd: 82, depression: 60, anxiety: 68 },
  { modality: "PE", ptsd: 88, depression: 55, anxiety: 60 },
  { modality: "DBT", ptsd: 70, depression: 75, anxiety: 78 },
  { modality: "Somatic", ptsd: 75, depression: 65, anxiety: 72 },
  { modality: "IFS", ptsd: 72, depression: 70, anxiety: 70 },
];

const treatmentModalitiesConfig: ChartConfig = {
  ptsd: {
    label: "PTSD Effectiveness",
    color: "hsl(var(--chart-1))",
  },
  depression: {
    label: "Depression",
    color: "hsl(var(--chart-2))",
  },
  anxiety: {
    label: "Anxiety",
    color: "hsl(var(--destructive))",
  },
};

export function TreatmentModalitiesChart() {
  return (
    <ChartFrame
      data={treatmentModalitiesData}
      config={treatmentModalitiesConfig}
      title="Treatment Modality Effectiveness"
      subtitle="Effectiveness of trauma treatment approaches by condition"
      source={
        <>
          Bisson, J. I., et al. (2013). Psychological therapies for chronic PTSD in adults.
          <em>Cochrane Database of Systematic Reviews</em>, CD003388. Magnitudes are
          illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={treatmentModalitiesConfig} className="h-[300px] w-full">
        <BarChart data={treatmentModalitiesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="modality" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="depression" fill="var(--color-depression)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="anxiety" fill="var(--color-anxiety)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Cognitive Distortions Chart
const cognitiveDistortionsData = [
  { distortion: "All-or-Nothing", frequency: 78 },
  { distortion: "Catastrophizing", frequency: 72 },
  { distortion: "Mind Reading", frequency: 68 },
  { distortion: "Should Statements", frequency: 75 },
  { distortion: "Personalization", frequency: 65 },
  { distortion: "Emotional Reasoning", frequency: 70 },
  { distortion: "Overgeneralization", frequency: 67 },
  { distortion: "Mental Filter", frequency: 62 },
];

const cognitiveDistortionsConfig: ChartConfig = {
  frequency: {
    label: "Frequency in Trauma Survivors (%)",
    color: "hsl(var(--primary))",
  },
};

export function CognitiveDistortionsChart() {
  return (
    <ChartFrame
      data={cognitiveDistortionsData}
      config={cognitiveDistortionsConfig}
      title="Common Cognitive Distortions in Trauma"
      subtitle="Prevalence of thinking errors among trauma survivors"
      source={
        <>
          Distortions after Beck, A. T. (1976). <em>Cognitive Therapy and the Emotional
          Disorders</em>, and Burns, D. D. (1980). <em>Feeling Good</em>. Magnitudes are
          illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={cognitiveDistortionsConfig} className="h-[350px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={cognitiveDistortionsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="distortion" width={130} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="frequency" fill="var(--color-frequency)" radius={4}>
            <LabelList
              dataKey="frequency"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Mindfulness Benefits Chart
const mindfulnessBenefitsData = [
  { week: "Week 1", stress: 70, focus: 45, regulation: 40 },
  { week: "Week 2", stress: 62, focus: 52, regulation: 48 },
  { week: "Week 4", stress: 50, focus: 60, regulation: 58 },
  { week: "Week 8", stress: 38, focus: 72, regulation: 70 },
  { week: "Week 12", stress: 30, focus: 78, regulation: 80 },
];

const mindfulnessBenefitsConfig: ChartConfig = {
  stress: {
    label: "Stress Level",
    color: "hsl(var(--destructive))",
  },
  focus: {
    label: "Focus Ability",
    color: "hsl(var(--chart-1))",
  },
  regulation: {
    label: "Emotional Regulation",
    color: "hsl(var(--chart-2))",
  },
};

export function MindfulnessBenefitsChart() {
  return (
    <ChartFrame
      data={mindfulnessBenefitsData}
      config={mindfulnessBenefitsConfig}
      title="Mindfulness Practice Benefits Over Time"
      subtitle="Improvements from regular mindfulness practice"
      source={
        <>
          Direction of effect after Khoury, B., et al. (2013). Mindfulness-based therapy: A
          comprehensive meta-analysis. <em>Clinical Psychology Review, 33</em>(6), 763–771.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={mindfulnessBenefitsConfig} className="h-[300px] w-full">
        <LineChart data={mindfulnessBenefitsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="stress" stroke="var(--color-stress)" strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="focus" stroke="var(--color-focus)" strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="regulation" stroke="var(--color-regulation)" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Somatic Therapy Techniques Chart
const somaticTherapyData = [
  { technique: "Body Awareness", effectiveness: 85 },
  { technique: "Breath Work", effectiveness: 88 },
  { technique: "Grounding", effectiveness: 82 },
  { technique: "Titration", effectiveness: 78 },
  { technique: "Pendulation", effectiveness: 75 },
  { technique: "Movement", effectiveness: 80 },
];

const somaticTherapyConfig: ChartConfig = {
  effectiveness: {
    label: "Effectiveness Rating",
    color: "hsl(var(--primary))",
  },
};

export function SomaticTherapyChart() {
  return (
    <ChartFrame
      data={somaticTherapyData}
      config={somaticTherapyConfig}
      title="Somatic Therapy Techniques"
      subtitle="Effectiveness of body-based trauma interventions"
      source={
        <>
          Techniques after Levine, P. A. (1997). <em>Waking the Tiger</em>. North Atlantic
          Books. The evidence base is younger and thinner than for CBT or EMDR; see Kuhfuß,
          M., et al. (2021). <em>European Journal of Psychotraumatology, 12</em>(1), 1929023.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={somaticTherapyConfig} className="h-[300px] w-full">
        <RadarChart data={somaticTherapyData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="technique" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar isAnimationActive={!staticCharts}
            name="Effectiveness"
            dataKey="effectiveness"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// EMDR Processing Phases Chart
const emdrPhasesData = [
  { phase: "History Taking", time: 15, importance: 80 },
  { phase: "Preparation", time: 20, importance: 90 },
  { phase: "Assessment", time: 10, importance: 85 },
  { phase: "Desensitization", time: 30, importance: 95 },
  { phase: "Installation", time: 10, importance: 88 },
  { phase: "Body Scan", time: 8, importance: 82 },
  { phase: "Closure", time: 7, importance: 78 },
];

const emdrPhasesConfig: ChartConfig = {
  time: {
    label: "Avg. Session Time (%)",
    color: "hsl(var(--chart-1))",
  },
  importance: {
    label: "Clinical Importance",
    color: "hsl(var(--chart-2))",
  },
};

export function EMDRPhasesChart() {
  return (
    <ChartFrame
      data={emdrPhasesData}
      config={emdrPhasesConfig}
      title="EMDR Treatment Phases"
      subtitle="The 8-phase EMDR protocol"
      source={
        <>
          Shapiro, F. (2018). <em>Eye Movement Desensitization and Reprocessing</em> (3rd
          ed.). Guilford. The eight phases are the protocol; the session counts are typical
          rather than prescribed.
        </>
      }
    >
      <ChartContainer config={emdrPhasesConfig} className="h-[350px] w-full">
        <BarChart data={emdrPhasesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="phase" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="time" fill="var(--color-time)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="importance" fill="var(--color-importance)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Boundary Types Chart
const boundaryTypesData = [
  { type: "Physical", healthy: 85, porous: 30, rigid: 20 },
  { type: "Emotional", healthy: 80, porous: 45, rigid: 25 },
  { type: "Time", healthy: 75, porous: 50, rigid: 30 },
  { type: "Sexual", healthy: 90, porous: 20, rigid: 35 },
  { type: "Material", healthy: 78, porous: 40, rigid: 28 },
  { type: "Digital", healthy: 70, porous: 55, rigid: 22 },
];

const boundaryTypesConfig: ChartConfig = {
  healthy: {
    label: "Healthy (%)",
    color: "hsl(var(--chart-1))",
  },
  porous: {
    label: "Porous (%)",
    color: "hsl(var(--chart-2))",
  },
  rigid: {
    label: "Rigid (%)",
    color: "hsl(var(--destructive))",
  },
};

export function BoundaryTypesChart() {
  return (
    <ChartFrame
      data={boundaryTypesData}
      config={boundaryTypesConfig}
      title="Types of Boundaries"
      subtitle="Distribution of boundary styles across different areas"
      source={
        <>
          Boundary styles after Mellody, P. (1989). <em>Facing Codependence</em>. Harper &amp;
          Row, and Cloud, H., &amp; Townsend, J. (1992). <em>Boundaries</em>. Zondervan.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={boundaryTypesConfig} className="h-[300px] w-full">
        <BarChart data={boundaryTypesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="porous" fill="var(--color-porous)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="rigid" fill="var(--color-rigid)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Inner Child Healing Progress Chart
const innerChildHealingData = [
  { month: "Month 1", awareness: 30, safety: 25, expression: 20 },
  { month: "Month 3", awareness: 55, safety: 45, expression: 40 },
  { month: "Month 6", awareness: 72, safety: 65, expression: 58 },
  { month: "Month 9", awareness: 82, safety: 78, expression: 72 },
  { month: "Month 12", awareness: 90, safety: 88, expression: 85 },
];

const innerChildHealingConfig: ChartConfig = {
  awareness: {
    label: "Self-Awareness",
    color: "hsl(var(--chart-1))",
  },
  safety: {
    label: "Felt Safety",
    color: "hsl(var(--chart-2))",
  },
  expression: {
    label: "Emotional Expression",
    color: "hsl(var(--destructive))",
  },
};

export function InnerChildHealingChart() {
  return (
    <ChartFrame
      data={innerChildHealingData}
      config={innerChildHealingConfig}
      title="Inner Child Healing Progress"
      subtitle="Typical healing trajectory in inner child work"
      source={
        <>
          Schwartz, R. C. (1995). <em>Internal Family Systems Therapy</em>. Guilford.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={innerChildHealingConfig} className="h-[300px] w-full">
        <LineChart data={innerChildHealingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="awareness" stroke="var(--color-awareness)" strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="safety" stroke="var(--color-safety)" strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="expression" stroke="var(--color-expression)" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Distress Tolerance Skills Chart
const distressToleranceData = [
  { skill: "TIPP", effectiveness: 92 },
  { skill: "ACCEPTS", effectiveness: 85 },
  { skill: "Self-Soothe", effectiveness: 80 },
  { skill: "IMPROVE", effectiveness: 78 },
  { skill: "Pros & Cons", effectiveness: 75 },
  { skill: "Radical Acceptance", effectiveness: 88 },
];

const distressToleranceConfig: ChartConfig = {
  effectiveness: {
    label: "Effectiveness Rating",
    color: "hsl(var(--primary))",
  },
};

export function DistressToleranceSkillsChart() {
  return (
    <ChartFrame
      data={distressToleranceData}
      config={distressToleranceConfig}
      title="DBT Distress Tolerance Skills"
      subtitle="Effectiveness ratings for crisis survival skills"
      source={
        <>
          Skills after Linehan, M. M. (2015). <em>DBT Skills Training Manual</em> (2nd ed.).
          Guilford. Magnitudes are illustrative — they show the pattern clinicians describe,
          not measured values.
        </>
      }
    >
      <ChartContainer config={distressToleranceConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={distressToleranceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4}>
            <LabelList
              dataKey="effectiveness"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

// Interpersonal Effectiveness Chart
const interpersonalEffectivenessData = [
  { skill: "DEAR MAN", objective: 90, relationship: 75, selfrespect: 80 },
  { skill: "GIVE", objective: 60, relationship: 95, selfrespect: 70 },
  { skill: "FAST", objective: 65, relationship: 70, selfrespect: 95 },
];

const interpersonalEffectivenessConfig: ChartConfig = {
  objective: {
    label: "Objective Effectiveness",
    color: "hsl(var(--chart-1))",
  },
  relationship: {
    label: "Relationship Effectiveness",
    color: "hsl(var(--chart-2))",
  },
  selfrespect: {
    label: "Self-Respect Effectiveness",
    color: "hsl(var(--destructive))",
  },
};

export function InterpersonalEffectivenessChart() {
  return (
    <ChartFrame
      data={interpersonalEffectivenessData}
      config={interpersonalEffectivenessConfig}
      title="DBT Interpersonal Effectiveness Skills"
      subtitle="When to use each skill set"
      source={
        <>
          Linehan, M. M. (2015). <em>DBT Skills Training Manual</em> (2nd ed.). Guilford. DEAR
          MAN, GIVE and FAST are her acronyms. Magnitudes are illustrative — they show the
          pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={interpersonalEffectivenessConfig} className="h-[300px] w-full">
        <BarChart data={interpersonalEffectivenessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="objective" fill="var(--color-objective)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="relationship" fill="var(--color-relationship)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="selfrespect" fill="var(--color-selfrespect)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionPrevalenceData = [
  { group: "General Adults", rate: 4.5 },
  { group: "Men", rate: 6.0 },
  { group: "Women", rate: 3.0 },
  { group: "Trauma History", rate: 14.0 },
  { group: "Childhood Sex Abuse", rate: 22.0 },
  { group: "Co-occurring Addiction", rate: 28.0 },
];

const sexAddictionPrevalenceConfig: ChartConfig = {
  rate: { label: "Prevalence (%)", color: "hsl(var(--primary))" },
};

export function SexAddictionPrevalenceChart() {
  return (
    <ChartFrame
      data={sexAddictionPrevalenceData}
      config={sexAddictionPrevalenceConfig}
      title="Sex Addiction Prevalence by Population"
      subtitle="Estimated prevalence of compulsive sexual behavior disorder across populations"
      source={
        <>
          Kraus, S. W., Voon, V., &amp; Potenza, M. N. (2016). Should compulsive sexual
          behavior be considered an addiction? <em>Addiction, 111</em>(12), 2097–2106. The
          disorder is ICD-11 6C72; prevalence estimates vary by instrument and are not
          settled.
        </>
      }
    >
      <ChartContainer config={sexAddictionPrevalenceConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={sexAddictionPrevalenceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 35]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="group" width={160} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="rate" fill="var(--color-rate)" radius={4}>
            <LabelList
              dataKey="rate"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionBrainData = [
  { region: "Nucleus Accumbens", addiction: 95, healthy: 40 },
  { region: "Prefrontal Cortex", addiction: 35, healthy: 85 },
  { region: "Amygdala", addiction: 90, healthy: 50 },
  { region: "Anterior Cingulate", addiction: 45, healthy: 80 },
  { region: "Ventral Striatum", addiction: 88, healthy: 45 },
];

const sexAddictionBrainConfig: ChartConfig = {
  addiction: { label: "Sex Addiction (%)", color: "hsl(var(--chart-1))" },
  healthy: { label: "Healthy Control (%)", color: "hsl(var(--chart-2))" },
};

export function SexAddictionBrainChart() {
  return (
    <ChartFrame
      data={sexAddictionBrainData}
      config={sexAddictionBrainConfig}
      title="Brain Region Activity: Sex Addiction vs. Healthy Controls"
      subtitle="Relative activation levels in key brain regions during sexual cue exposure"
      source={
        <>
          Kühn, S., &amp; Gallinat, J. (2014). Brain structure and functional connectivity
          associated with pornography consumption. <em>JAMA Psychiatry, 71</em>(7), 827–834.
          Cross-sectional: it shows an association, not that one caused the other.
        </>
      }
    >
      <ChartContainer config={sexAddictionBrainConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionBrainData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="region" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="addiction" fill="var(--color-addiction)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="healthy" fill="var(--color-healthy)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionTraumaData = [
  { trauma: "Emotional Abuse", percentage: 97 },
  { trauma: "Sexual Abuse", percentage: 83 },
  { trauma: "Physical Abuse", percentage: 71 },
  { trauma: "Family Dysfunction", percentage: 97 },
  { trauma: "Neglect", percentage: 68 },
  { trauma: "Witnessing Violence", percentage: 59 },
];

const sexAddictionTraumaConfig: ChartConfig = {
  percentage: { label: "Reporting Childhood Trauma (%)", color: "hsl(var(--chart-3))" },
};

export function SexAddictionTraumaChart() {
  return (
    <ChartFrame
      data={sexAddictionTraumaData}
      config={sexAddictionTraumaConfig}
      title="Childhood Trauma in Sex Addiction"
      subtitle="Percentage of sex addicts reporting specific childhood trauma types"
      source={
        <>
          Carnes, P. (2001). <em>Out of the Shadows: Understanding Sexual Addiction</em> (3rd
          ed.). Hazelden. Figures come from clinical samples in treatment, which are not the
          general population.
        </>
      }
    >
      <ChartContainer config={sexAddictionTraumaConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={sexAddictionTraumaData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="trauma" width={150} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const carnesCycleData = [
  { phase: "Preoccupation", intensity: 65, duration: 40 },
  { phase: "Ritualization", intensity: 80, duration: 25 },
  { phase: "Acting Out", intensity: 95, duration: 15 },
  { phase: "Shame & Despair", intensity: 85, duration: 20 },
];

const carnesCycleConfig: ChartConfig = {
  intensity: { label: "Neurochemical Intensity (%)", color: "hsl(var(--chart-1))" },
  duration: { label: "Relative Duration (%)", color: "hsl(var(--chart-2))" },
};

export function CarnesAddictionCycleChart() {
  return (
    <ChartFrame
      data={carnesCycleData}
      config={carnesCycleConfig}
      title="Carnes' Four-Phase Addiction Cycle"
      subtitle="Relative neurochemical intensity and duration of each phase"
      source={
        <>
          Carnes, P. (2001). <em>Out of the Shadows</em> (3rd ed.). Hazelden; the four-phase
          cycle first appeared in the 1983 edition. Magnitudes are illustrative — they show
          the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={carnesCycleConfig} className="h-[300px] w-full">
        <BarChart data={carnesCycleData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="phase" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="intensity" fill="var(--color-intensity)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="duration" fill="var(--color-duration)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionBeliefsData = [
  { belief: "I am worthless", percentage: 91 },
  { belief: "No one could love me", percentage: 87 },
  { belief: "Sex is my primary need", percentage: 84 },
  { belief: "Others can't meet my needs", percentage: 79 },
  { belief: "I don't deserve recovery", percentage: 72 },
];

const sexAddictionBeliefsConfig: ChartConfig = {
  percentage: { label: "Sex Addicts Endorsing (%)", color: "hsl(var(--chart-4))" },
};

export function SexAddictionBeliefsChart() {
  return (
    <ChartFrame
      data={sexAddictionBeliefsData}
      config={sexAddictionBeliefsConfig}
      title="Core Belief System in Sex Addiction"
      subtitle="Percentage of sex addicts endorsing core distorted beliefs"
      source={
        <>
          Carnes, P. (2001). <em>Out of the Shadows</em> (3rd ed.). Hazelden. Clinical sample,
          not the general population.
        </>
      }
    >
      <ChartContainer config={sexAddictionBeliefsConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={sexAddictionBeliefsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="belief" width={175} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="percentage" fill="var(--color-percentage)" radius={4}>
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const threeCirclesData = [
  { name: "Inner Circle (Addictive)", value: 20, fill: "hsl(var(--destructive))" },
  { name: "Middle Circle (Caution)", value: 35, fill: "hsl(var(--chart-4))" },
  { name: "Outer Circle (Healthy)", value: 45, fill: "hsl(var(--chart-2))" },
];

/**
 * The one plotted figure with no table behind it.
 *
 * Its slices are drawn at 20, 35 and 45 per cent for legibility and mean
 * nothing, as the source note says. Tabulating those numbers would present an
 * illustration as a measurement, so it carries a description instead.
 */
export function ThreeCirclesChart() {
  return (
    <ChartFrame
      title="Three Circles Model of Sexual Recovery"
      subtitle="Framework for defining personal sexual sobriety"
      description={
        "Three concentric circles. The inner circle holds the behaviours that " +
        "count as acting out, the middle circle the ones that lead there, and " +
        "the outer circle the healthy activity that recovery is for. What goes " +
        "in each is defined by the individual. The areas drawn are illustrative " +
        "and carry no meaning."
      }
      source={
        <>
          The three-circle tool as used in Sex Addicts Anonymous, <em>Sex Addicts
          Anonymous</em> (3rd ed., 2005), building on Carnes, P. (2001). <em>Out of the
          Shadows</em> (3rd ed.). Hazelden. What goes in each circle is yours to define with a
          sponsor or therapist — the sizes here mean nothing.
        </>
      }
    >
      <ChartContainer config={{}} className="h-[300px] w-full">
        <PieChart>
          <Pie isAnimationActive={!staticCharts} data={threeCirclesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
            {threeCirclesData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const loveAddictionPatternsData = [
  { pattern: "Fear of abandonment", loveAddict: 92, loveAvoidant: 35 },
  { pattern: "Loss of self in relationship", loveAddict: 88, loveAvoidant: 20 },
  { pattern: "Tolerating abuse", loveAddict: 76, loveAvoidant: 25 },
  { pattern: "Fear of engulfment", loveAddict: 28, loveAvoidant: 89 },
  { pattern: "Emotional withdrawal", loveAddict: 22, loveAvoidant: 84 },
];

const loveAddictionPatternsConfig: ChartConfig = {
  loveAddict: { label: "Love Addict (%)", color: "hsl(var(--chart-1))" },
  loveAvoidant: { label: "Love Avoidant (%)", color: "hsl(var(--chart-3))" },
};

export function LoveAddictionPatternsChart() {
  return (
    <ChartFrame
      data={loveAddictionPatternsData}
      config={loveAddictionPatternsConfig}
      title="Love Addiction vs. Love Avoidance Patterns"
      subtitle="Comparison of behavioral patterns in love addiction and love avoidance"
      source={
        <>
          Mellody, P., Miller, A. W., &amp; Miller, J. K. (2003). <em>Facing Love
          Addiction</em>. HarperOne. Magnitudes are illustrative — they show the pattern
          clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={loveAddictionPatternsConfig} className="h-[320px] w-full">
        <BarChart data={loveAddictionPatternsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="pattern" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="loveAddict" fill="var(--color-loveAddict)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="loveAvoidant" fill="var(--color-loveAvoidant)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const traumaBondingData = [
  { phase: "Love Bombing", intensity: 90 },
  { phase: "Devaluation Begins", intensity: 65 },
  { phase: "Abuse/Withdrawal", intensity: 30 },
  { phase: "Relief/Reconciliation", intensity: 88 },
  { phase: "Honeymoon", intensity: 85 },
  { phase: "Tension Builds", intensity: 50 },
  { phase: "Abuse Repeats", intensity: 25 },
];

const traumaBondingConfig: ChartConfig = {
  intensity: { label: "Emotional Intensity", color: "hsl(var(--chart-1))" },
};

export function TraumaBondingCycleChart() {
  return (
    <ChartFrame
      data={traumaBondingData}
      config={traumaBondingConfig}
      title="Trauma Bonding Cycle"
      subtitle="Intermittent reinforcement patterns that create powerful trauma bonds"
      source={
        <>
          Dutton, D. G., &amp; Painter, S. (1993). Emotional attachments in abusive
          relationships: A test of traumatic bonding theory. <em>Violence and Victims,
          8</em>(2), 105–120. Magnitudes are illustrative — they show the pattern clinicians
          describe, not measured values.
        </>
      }
    >
      <ChartContainer config={traumaBondingConfig} className="h-[300px] w-full">
        <LineChart data={traumaBondingData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="phase" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="intensity" stroke="var(--color-intensity)" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const meadowsTreatmentData = [
  { component: "Trauma Therapy", effectiveness: 87 },
  { component: "Psychodrama", effectiveness: 82 },
  { component: "Equine Therapy", effectiveness: 79 },
  { component: "EMDR", effectiveness: 85 },
  { component: "Group Therapy", effectiveness: 88 },
  { component: "12-Step Integration", effectiveness: 80 },
  { component: "Grief Work", effectiveness: 83 },
];

const meadowsTreatmentConfig: ChartConfig = {
  effectiveness: { label: "Patient-Reported Benefit (%)", color: "hsl(var(--chart-2))" },
};

export function MeadowsTreatmentModelChart() {
  return (
    <ChartFrame
      data={meadowsTreatmentData}
      config={meadowsTreatmentConfig}
      title="Meadows Treatment Components & Effectiveness"
      subtitle="Patient-reported benefit ratings for key Meadows treatment modalities"
      source={
        <>
          Components after the Meadows model as described in Mellody, P. (1989). <em>Facing
          Codependence</em>. Harper &amp; Row. Benefit ratings are illustrative and not
          outcome data.
        </>
      }
    >
      <ChartContainer config={meadowsTreatmentConfig} className="h-[300px] w-full">
        <BarChart margin={{ top: 24, right: 8, bottom: 5, left: 5 }} data={meadowsTreatmentData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="component" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4}>
            <LabelList
              dataKey="effectiveness"
              position="top"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const meadowsOutcomeData = [
  { timepoint: "Intake", sobriety: 0, wellbeing: 30, relationships: 25 },
  { timepoint: "30 Days", sobriety: 65, wellbeing: 45, relationships: 35 },
  { timepoint: "90 Days", sobriety: 75, wellbeing: 58, relationships: 48 },
  { timepoint: "6 Months", sobriety: 80, wellbeing: 68, relationships: 60 },
  { timepoint: "1 Year", sobriety: 82, wellbeing: 75, relationships: 70 },
  { timepoint: "2 Years", sobriety: 85, wellbeing: 82, relationships: 78 },
];

const meadowsOutcomeConfig: ChartConfig = {
  sobriety: { label: "Sobriety Maintenance (%)", color: "hsl(var(--chart-1))" },
  wellbeing: { label: "Overall Well-being (%)", color: "hsl(var(--chart-2))" },
  relationships: { label: "Relationship Quality (%)", color: "hsl(var(--chart-3))" },
};

export function MeadowsOutcomeChart() {
  return (
    <ChartFrame
      data={meadowsOutcomeData}
      config={meadowsOutcomeConfig}
      title="Recovery Outcomes Over Time"
      subtitle="Trajectory of sobriety maintenance, well-being, and relationship quality during recovery"
      source={
        <>
          Carnes, P., et al. (2005). <em>Facing the Shadow</em>. Gentle Path Press. Magnitudes
          are illustrative — they show the pattern clinicians describe, not measured values.
        </>
      }
    >
      <ChartContainer config={meadowsOutcomeConfig} className="h-[300px] w-full">
        <LineChart data={meadowsOutcomeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="timepoint" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="sobriety" stroke="var(--color-sobriety)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="wellbeing" stroke="var(--color-wellbeing)" strokeWidth={2} dot={{ r: 4 }} />
          <Line isAnimationActive={!staticCharts} type="monotone" dataKey="relationships" stroke="var(--color-relationships)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionRecoveryProgressData = [
  { stage: "Crisis", innerCircle: 90, middleCircle: 70, outerCircle: 10 },
  { stage: "Early Recovery", innerCircle: 60, middleCircle: 55, outerCircle: 30 },
  { stage: "Growth", innerCircle: 30, middleCircle: 40, outerCircle: 60 },
  { stage: "Maintenance", innerCircle: 15, middleCircle: 25, outerCircle: 80 },
  { stage: "Flourishing", innerCircle: 5, middleCircle: 15, outerCircle: 92 },
];

const sexAddictionRecoveryProgressConfig: ChartConfig = {
  innerCircle: { label: "Inner Circle Activity (%)", color: "hsl(var(--destructive))" },
  middleCircle: { label: "Middle Circle Activity (%)", color: "hsl(var(--chart-4))" },
  outerCircle: { label: "Outer Circle Activity (%)", color: "hsl(var(--chart-2))" },
};

export function SexAddictionRecoveryProgressChart() {
  return (
    <ChartFrame
      data={sexAddictionRecoveryProgressData}
      config={sexAddictionRecoveryProgressConfig}
      title="Recovery Progress Through the Three Circles"
      subtitle="Shift in behavioral patterns across recovery stages"
      source={
        <>
          Stages after Carnes, P. (2001). <em>Out of the Shadows</em> (3rd ed.). Hazelden.
          Magnitudes are illustrative — they show the pattern clinicians describe, not
          measured values.
        </>
      }
    >
      <ChartContainer config={sexAddictionRecoveryProgressConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionRecoveryProgressData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="stage" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="innerCircle" fill="var(--color-innerCircle)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="middleCircle" fill="var(--color-middleCircle)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="outerCircle" fill="var(--color-outerCircle)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sexAddictionRecoveryRoadmapData = [
  { milestone: "Disclosure", month: 1, completion: 100 },
  { milestone: "30-Day Sobriety", month: 1, completion: 85 },
  { milestone: "Support Group", month: 1, completion: 90 },
  { milestone: "CSAT Therapy", month: 2, completion: 78 },
  { milestone: "Trauma Work Begins", month: 4, completion: 65 },
  { milestone: "Partner Work", month: 6, completion: 60 },
  { milestone: "1-Year Sobriety", month: 12, completion: 55 },
  { milestone: "Sexual Health Plan", month: 18, completion: 50 },
];

const sexAddictionRecoveryRoadmapConfig: ChartConfig = {
  completion: { label: "% Completing Milestone", color: "hsl(var(--primary))" },
};

export function SexAddictionRecoveryRoadmapChart() {
  return (
    <ChartFrame
      data={sexAddictionRecoveryRoadmapData}
      config={sexAddictionRecoveryRoadmapConfig}
      title="Sex Addiction Recovery Milestones"
      subtitle="Key recovery milestones and typical completion rates in sex addiction treatment"
      source={
        <>
          Milestones after Carnes, P. (2010). <em>Facing the Shadow</em> (2nd ed.). Gentle
          Path Press. Completion rates are illustrative.
        </>
      }
    >
      <ChartContainer config={sexAddictionRecoveryRoadmapConfig} className="h-[320px] w-full">
        <BarChart margin={{ top: 5, right: 46, bottom: 5, left: 5 }} data={sexAddictionRecoveryRoadmapData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="milestone" width={165} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="completion" fill="var(--color-completion)" radius={4}>
            <LabelList
              dataKey="completion"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const treatmentAccessData = [
  { type: "12-Step Groups", accessibility: 95, cost: 5, availability: 98 },
  { type: "Outpatient Therapy", accessibility: 72, cost: 45, availability: 75 },
  { type: "IOP Program", accessibility: 55, cost: 35, availability: 60 },
  { type: "Residential (30d)", accessibility: 30, cost: 15, availability: 40 },
  { type: "Residential (90d)", accessibility: 18, cost: 8, availability: 25 },
];

const treatmentAccessConfig: ChartConfig = {
  accessibility: { label: "Accessibility Score", color: "hsl(var(--chart-1))" },
  availability: { label: "National Availability (%)", color: "hsl(var(--chart-2))" },
};

export function TreatmentAccessChart() {
  return (
    <ChartFrame
      data={treatmentAccessData}
      config={treatmentAccessConfig}
      title="Treatment Options: Accessibility & Availability"
      subtitle="Relative accessibility and national availability of sex addiction treatment options"
      source={
        <>
          Options as catalogued by the International Institute for Trauma and Addiction
          Professionals. Accessibility and availability scores are illustrative and vary
          enormously by country and by what your insurance will cover.
        </>
      }
    >
      <ChartContainer config={treatmentAccessConfig} className="h-[300px] w-full">
        <BarChart data={treatmentAccessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="accessibility" fill="var(--color-accessibility)" radius={4} />
          <Bar isAnimationActive={!staticCharts} dataKey="availability" fill="var(--color-availability)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

export const ChartComponents = {
  PTSDPrevalenceChart,
  ACEsPrevalenceChart,
  RecoveryTimelineChart,
  TraumaAddictionChart,
  TherapyEffectivenessChart,
  AttachmentStylesChart,
  ACEsHealthRiskChart,
  PostTraumaticGrowthChart,
  IPVPTSDChart,
  DBTSkillsChart,
  PhysicalWellnessChart,
  ExerciseImpactChart,
  FourPillarsChart,
  EmotionalRegulationChart,
  MentalWellnessChart,
  SocialConnectionChart,
  NutritionImpactChart,
  SleepRecoveryChart,
  AmygdalaActivityChart,
  BrainRegionsTraumaChart,
  NeurotransmitterLevelsChart,
  CortisolPatternChart,
  PolyvagalStatesChart,
  PTSDSymptomsChart,
  ComplexPTSDChart,
  BrainHealingChart,
  WindowToleranceChart,
  AdultTraumaTypesChart,
  GroundingTechniquesChart,
  CopingStrategiesChart,
  ResilienceFactorsChart,
  SpiritualPracticesChart,
  RecoveryValuesChart,
  TreatmentModalitiesChart,
  CognitiveDistortionsChart,
  MindfulnessBenefitsChart,
  SomaticTherapyChart,
  EMDRPhasesChart,
  BoundaryTypesChart,
  InnerChildHealingChart,
  DistressToleranceSkillsChart,
  InterpersonalEffectivenessChart,
  SexAddictionPrevalenceChart,
  SexAddictionBrainChart,
  SexAddictionTraumaChart,
  CarnesAddictionCycleChart,
  SexAddictionBeliefsChart,
  ThreeCirclesChart,
  LoveAddictionPatternsChart,
  TraumaBondingCycleChart,
  MeadowsTreatmentModelChart,
  MeadowsOutcomeChart,
  SexAddictionRecoveryProgressChart,
  SexAddictionRecoveryRoadmapChart,
  TreatmentAccessChart,
};

/* ------------------------------------------------------------------ *
 * Charts drawn from the author's treatment journal.
 * Figures are sourced in each chart's caption; see
 * docs/source-notes/journal-transcription.md for the originals.
 * ------------------------------------------------------------------ */

const heritabilityData = [
  { substance: "Cocaine", low: 42, high: 79 },
  { substance: "Nicotine", low: 33, high: 71 },
  { substance: "Alcohol", low: 48, high: 66 },
  { substance: "Cannabis", low: 51, high: 59 },
  { substance: "Opioids", low: 23, high: 49 },
  { substance: "Gambling", low: 35, high: 54 },
].map((d) => ({ ...d, span: d.high - d.low, midpoint: (d.low + d.high) / 2 }));

const heritabilityConfig: ChartConfig = {
  low: { label: "Lower estimate (%)", color: "transparent" },
  span: { label: "Heritability range (%)", color: "hsl(var(--primary))" },
};

export function AddictionHeritabilityChart() {
  return (
    <ChartFrame
      data={heritabilityData}
      config={heritabilityConfig}
      title="How Heritable Is Addiction?"
      subtitle={
        <>
          Proportion of the variation in liability that twin and family studies
          attribute to genes. Bars show the range across studies, not a single number.
        </>
      }
      source={
        <>
          Goldman, D., Oroszi, G., &amp; Ducci, F. (2005). The genetics of addictions:
          uncovering the genes. <em>Nature Reviews Genetics, 6</em>(7), 521–532.
          Heritability is a population statistic: it describes variation across a group,
          never the odds for any one person.
        </>
      }
    >
      <ChartContainer config={heritabilityConfig} className="h-[320px] w-full">
        <BarChart data={heritabilityData} layout="vertical" stackOffset="sign">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="substance" width={90} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="low" stackId="a" fill="transparent" />
          <Bar isAnimationActive={!staticCharts} dataKey="span" stackId="a" fill="var(--color-span)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const dopamineKineticsData = Array.from({ length: 61 }, (_, i) => {
  const t = i; // minutes
  const curve = (peak: number, rise: number, decay: number) =>
    Math.round(peak * (1 - Math.exp(-t / rise)) * Math.exp(-t / decay));
  return {
    minute: t,
    smoked: curve(1100, 0.7, 16),
    injected: curve(950, 1.6, 22),
    snorted: curve(420, 6, 40),
    oral: curve(180, 18, 90),
  };
});

const dopamineKineticsConfig: ChartConfig = {
  smoked: { label: "Fast (smoked)", color: "hsl(var(--chart-4))" },
  injected: { label: "Fast (injected)", color: "hsl(var(--chart-3))" },
  snorted: { label: "Slower (intranasal)", color: "hsl(var(--chart-1))" },
  oral: { label: "Slowest (oral)", color: "hsl(var(--chart-5))" },
};

export function DopamineRateChart() {
  return (
    <ChartFrame
      data={dopamineKineticsData}
      config={dopamineKineticsConfig}
      title="It's Not How Much — It's How Fast"
      subtitle={
        <>
          The same drug, the same dose, delivered by different routes. What predicts
          addictive potential is the steepness of the rise, not the size of the total.
        </>
      }
      source={
        <>
          Schematic, showing dopamine in the nucleus accumbens as a percentage of
          baseline. Shape after Volkow, N. D., et al. (2000), and the rate hypothesis
          set out in Kevin McCauley's <em>Pleasure Unwoven</em> (2010).
        </>
      }
    >
      <ChartContainer config={dopamineKineticsConfig} className="h-[320px] w-full">
        <LineChart data={dopamineKineticsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="minute"
            tickFormatter={(v) => `${v}m`}
            ticks={[0, 15, 30, 45, 60]}
          />
          <YAxis tickFormatter={(v) => `${v}%`} label={undefined} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} dataKey="smoked" stroke="var(--color-smoked)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} dataKey="injected" stroke="var(--color-injected)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} dataKey="snorted" stroke="var(--color-snorted)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} dataKey="oral" stroke="var(--color-oral)" dot={false} strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const alcoholNeurotransmitterData = Array.from({ length: 121 }, (_, i) => {
  const t = i / 20; // "drinks" elapsed
  const drink = Math.floor(t);
  const withinDrink = t - drink;
  const gabaWave = drink < 4 ? Math.sin(withinDrink * Math.PI) * 55 : 0;
  const glutamate = Math.min(72, t * 17);
  return {
    t: Number(t.toFixed(2)),
    glutamate: Math.round(glutamate),
    felt: Math.round(Math.max(0, glutamate + gabaWave - glutamate * 0.15)),
  };
});

const alcoholConfig: ChartConfig = {
  felt: { label: "GABA — how it feels", color: "hsl(var(--chart-1))" },
  glutamate: { label: "Glutamate — the floor", color: "hsl(var(--destructive))" },
};

export function AlcoholGabaGlutamateChart() {
  return (
    <ChartFrame
      data={alcoholNeurotransmitterData}
      config={alcoholConfig}
      title="Why the Hangover Gets Worse: GABA and Glutamate"
      subtitle={
        <>
          Each drink is a GABA wave that peaks and falls. Underneath it, glutamate
          climbs and does not come back down between drinks. The rising floor is
          the hangover.
        </>
      }
      source={
        <>
          Schematic. Alcohol potentiates GABA-A and inhibits NMDA glutamate
          receptors; the brain compensates by upregulating glutamate, which is what
          is left exposed when the alcohol clears. See Valenzuela, C. F. (1997),
          <em> Alcohol Health &amp; Research World, 21</em>(2), 144–148.
        </>
      }
    >
      <ChartContainer config={alcoholConfig} className="h-[320px] w-full">
        <LineChart data={alcoholNeurotransmitterData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t" tickFormatter={(v) => `${Math.round(v)}`} ticks={[0, 1, 2, 3, 4, 5, 6]} />
          <YAxis tickFormatter={(v) => `${v}`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} dataKey="felt" stroke="var(--color-felt)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts}
            dataKey="glutamate"
            stroke="var(--color-glutamate)"
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const relationshipTypesData = Array.from({ length: 61 }, (_, i) => {
  const months = i * 4; // 0 to 240 months (20 years)
  const bell = (peakAt: number, width: number, height: number) =>
    Math.round(height * Math.exp(-Math.pow((months - peakAt) / width, 2)));
  return {
    months,
    fantasy: bell(6, 9, 92),
    mask: bell(120, 62, 78),
    authenticity: Math.round(8 + months * 0.36),
  };
});

const relationshipTypesConfig: ChartConfig = {
  fantasy: { label: "Fantasy", color: "hsl(var(--chart-4))" },
  mask: { label: "The mask", color: "hsl(var(--chart-1))" },
  authenticity: { label: "Authenticity", color: "hsl(var(--chart-5))" },
};

export function RelationshipTypesChart() {
  return (
    <ChartFrame
      data={relationshipTypesData}
      config={relationshipTypesConfig}
      title="Three Ways a Relationship Can Go"
      subtitle={
        <>
          Fantasy burns hottest and is gone by about six months. The mask survives
          far longer — often a decade — and then collapses. Authenticity starts
          lower and never stops climbing.
        </>
      }
      source={
        <>
          The vertical axis is felt intensity, not quality. Fantasy and the mask both
          feel like more, right up until they stop.
        </>
      }
    >
      <ChartContainer config={relationshipTypesConfig} className="h-[320px] w-full">
        <LineChart data={relationshipTypesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="months"
            ticks={[0, 6, 60, 120, 180, 240]}
            tickFormatter={(v) => (v < 12 ? `${v}mo` : `${v / 12}yr`)}
          />
          <YAxis domain={[0, 100]} tick={false} tickLine={false} width={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts} dataKey="fantasy" stroke="var(--color-fantasy)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts} dataKey="mask" stroke="var(--color-mask)" dot={false} strokeWidth={2} />
          <Line isAnimationActive={!staticCharts}
            dataKey="authenticity"
            stroke="var(--color-authenticity)"
            dot={false}
            strokeWidth={2.5}
          />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const sobrietyChallengesData = [
  { challenge: "Distorted achievement", under: -70, over: 78 },
  { challenge: "Compromised self-image", under: -82, over: 64 },
  { challenge: "Lack of accountability", under: -74, over: 70 },
  { challenge: "Problematic self-care", under: -88, over: 61 },
  { challenge: "Impaired conscience", under: -60, over: 84 },
  { challenge: "Faulty realism", under: -66, over: 66 },
  { challenge: "Limited self-awareness", under: -80, over: 72 },
  { challenge: "Incomplete relationships", under: -76, over: 58 },
  { challenge: "Disordered affect", under: -85, over: 80 },
];

const sobrietyChallengesConfig: ChartConfig = {
  under: { label: "Underachieving", color: "hsl(var(--chart-2))" },
  over: { label: "Overachieving", color: "hsl(var(--chart-4))" },
};

export function SobrietyChallengesChart() {
  return (
    <ChartFrame
      data={sobrietyChallengesData}
      config={sobrietyChallengesConfig}
      title="Every Challenge Has Two Failure Modes"
      subtitle={
        <>
          You can miss the mark in either direction. Numbness and indulgent rage are
          the same challenge — disordered affect — failing at opposite ends.
        </>
      }
      source={
        <>
          After the sobriety challenges in Patrick Carnes, <em>Recovery Zone, Vol. 1</em>
          (Gentle Path Press, 2009). Bar lengths are illustrative, not measured.
        </>
      }
    >
      <ChartContainer config={sobrietyChallengesConfig} className="h-[420px] w-full">
        <BarChart data={sobrietyChallengesData} layout="vertical" stackOffset="sign">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[-100, 100]} tick={false} tickLine={false} height={8} />
          <YAxis type="category" dataKey="challenge" width={190} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="under" stackId="s" fill="var(--color-under)" radius={3} />
          <Bar isAnimationActive={!staticCharts} dataKey="over" stackId="s" fill="var(--color-over)" radius={3} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const recoveryStagesData = [
  { stage: "Developing", start: -24, length: 24 },
  { stage: "Crisis / decision", start: 0, length: 3 },
  { stage: "Shock", start: 0, length: 8 },
  { stage: "Grief", start: 6, length: 8 },
  { stage: "Repair", start: 12, length: 24 },
  { stage: "Growth", start: 24, length: 36 },
];

const recoveryStagesConfig: ChartConfig = {
  start: { label: "Begins (months)", color: "transparent" },
  length: { label: "Typical duration (months)", color: "hsl(var(--primary))" },
};

export function CarnesRecoveryStagesChart() {
  return (
    <ChartFrame
      data={recoveryStagesData}
      config={recoveryStagesConfig}
      title="The Stages Overlap"
      subtitle={
        <>
          Recovery is not a queue of stages you finish one at a time. Month zero is
          the crisis; grief is still running while repair has already started.
        </>
      }
      source={
        <>
          Durations as taught in programme, after Patrick Carnes,
          <em> Out of the Shadows</em> (3rd ed., Hazelden, 2001).
        </>
      }
    >
      <ChartContainer config={recoveryStagesConfig} className="h-[320px] w-full">
        <BarChart data={recoveryStagesData} layout="vertical" stackOffset="sign">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[-24, 60]}
            ticks={[-24, -12, 0, 12, 24, 36, 48, 60]}
            tickFormatter={(v) => (v === 0 ? "crisis" : `${v / 12}yr`)}
          />
          <YAxis type="category" dataKey="stage" width={140} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="start" stackId="g" fill="transparent" />
          <Bar isAnimationActive={!staticCharts} dataKey="length" stackId="g" fill="var(--color-length)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const worryWindowData = Array.from({ length: 97 }, (_, i) => {
  const t = i;
  const noise = Math.sin(t / 2.1) + Math.sin(t / 1.3) * 0.6 + Math.sin(t / 3.7) * 0.8;
  const before = t < 48 ? Math.round(50 + noise * 24) : null;
  const after = t >= 48 ? Math.round(50 + noise * 7) : null;
  return { t, before, after, upper: 68, lower: 32 };
});

const worryWindowConfig: ChartConfig = {
  before: { label: "Before treatment", color: "hsl(var(--destructive))" },
  after: { label: "After treatment", color: "hsl(var(--chart-5))" },
  upper: { label: "Window of tolerance", color: "hsl(var(--chart-1))" },
};

export function WorryWindowChart() {
  return (
    <ChartFrame
      data={worryWindowData}
      config={worryWindowConfig}
      title="Widen the Window, and the Worry Shrinks"
      subtitle={
        <>
          The events did not get smaller. The swings did. Same nervous system, same
          life, after the window of tolerance was widened.
        </>
      }
      source={
        <>
          Dashed lines mark the window of tolerance (Siegel, D., 1999). Drawn from the
          author's own before-and-after sketch.
        </>
      }
    >
      <ChartContainer config={worryWindowConfig} className="h-[320px] w-full">
        <LineChart data={worryWindowData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t" tick={false} tickLine={false} height={8} />
          <YAxis domain={[0, 100]} tick={false} tickLine={false} width={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line isAnimationActive={!staticCharts}
            dataKey="upper"
            stroke="var(--color-upper)"
            dot={false}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Line isAnimationActive={!staticCharts}
            dataKey="lower"
            stroke="var(--color-upper)"
            dot={false}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Line isAnimationActive={!staticCharts}
            dataKey="before"
            stroke="var(--color-before)"
            dot={false}
            strokeWidth={2}
            connectNulls={false}
          />
          <Line isAnimationActive={!staticCharts}
            dataKey="after"
            stroke="var(--color-after)"
            dot={false}
            strokeWidth={2}
            connectNulls={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

const enufCurveData = Array.from({ length: 81 }, (_, i) => {
  const x = (i - 40) / 13;
  return {
    x: i - 40,
    density: Math.round(100 * Math.exp(-0.5 * x * x)),
  };
});

const enufCurveConfig: ChartConfig = {
  density: { label: "Where people sit", color: "hsl(var(--primary))" },
};

export function FunctionalAdultCurveChart() {
  return (
    <ChartFrame
      data={enufCurveData}
      config={enufCurveConfig}
      title={<>"Enough" Is the Middle of the Curve</>}
      subtitle={
        <>
          The Functional Adult sits at the peak, running at roughly 65% — flexible,
          disciplined, relational, in reality, in moderation. Both tails are the
          problem, and only one of them looks like failure.
        </>
      }
      source={
        <>
          Ego states after Pia Mellody, <em>Facing Codependence</em> (Harper &amp; Row, 1989).
          The right-hand tail — "100% productive in a few narrow areas" — is the one
          the world tends to reward.
        </>
      }
    >
      <ChartContainer config={enufCurveConfig} className="h-[300px] w-full">
        <LineChart data={enufCurveData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="x"
            ticks={[-30, 0, 30]}
            tickFormatter={(v) =>
              v < 0 ? "Wounded Child" : v > 0 ? "Adapted Adult Child" : "Functional Adult"
            }
          />
          <YAxis tick={false} tickLine={false} width={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line isAnimationActive={!staticCharts} dataKey="density" stroke="var(--color-density)" dot={false} strokeWidth={2.5} />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  );
}

/**
 * Diagram components. These are figures rather than plots, so they are inline
 * SVG rather than Recharts. Colours come from theme tokens so they follow
 * light and dark mode, and every one carries a text alternative.
 */

export function DramaTriangleChart() {
  return (
    <ChartFrame
      title="The Drama Triangle, and the Way Out"
      subtitle={
        <>
          Three roles that hand each other the same feelings, and the three
          positions that dissolve them.
        </>
      }
      source={
        <>
          Roles after Karpman, S. (1968), <em>Transactional Analysis Bulletin, 7</em>(26),
          39–43. The empowered positions after Emerald, D. (2016),
          <em> The Power of TED</em> (3rd ed., Polaris).
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 520 330"
          className="w-full min-w-[440px] h-auto"
          role="img"
          aria-labelledby="drama-triangle-title drama-triangle-desc"
        >
          <title id="drama-triangle-title">The Karpman drama triangle</title>
          <desc id="drama-triangle-desc">
            Rescuer and Persecutor sit at the top corners, Victim at the bottom.
            Rescuer sends entitlement and resentment to Persecutor, and receives
            guilt and remorse back. Victim sends entitlement and resentment to
            Persecutor and guilt and powerlessness to Rescuer. Inside the
            triangle, the same three positions become Coach, Challenger and
            Creator.
          </desc>

          <polygon
            points="90,60 430,60 260,285"
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
            opacity="0.65"
          />
          <polygon
            points="175,175 345,175 260,60"
            fill="hsl(var(--primary))"
            opacity="0.08"
          />
          <polygon
            points="175,175 345,175 260,60"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          <g fill="hsl(var(--destructive))" fontSize="15" fontWeight="600">
            <text x="90" y="48" textAnchor="middle">Rescuer</text>
            <text x="430" y="48" textAnchor="middle">Persecutor</text>
            <text x="260" y="308" textAnchor="middle">Victim</text>
          </g>

          <g fill="hsl(var(--primary))" fontSize="13" fontWeight="600">
            <text x="260" y="52" textAnchor="middle" dy="-14">Creator</text>
            <text x="160" y="192" textAnchor="end">Coach</text>
            <text x="360" y="192" textAnchor="start">Challenger</text>
          </g>

          <g
            fill="hsl(var(--muted-foreground))"
            fontSize="10.5"
            fontStyle="italic"
          >
            <text x="260" y="76" textAnchor="middle">entitlement · resentment →</text>
            <text x="260" y="92" textAnchor="middle">← guilt · remorse</text>
            <text x="150" y="240" textAnchor="middle">guilt</text>
            <text x="150" y="254" textAnchor="middle">powerlessness</text>
            <text x="378" y="240" textAnchor="middle">entitlement</text>
            <text x="378" y="254" textAnchor="middle">resentment</text>
          </g>
        </svg>
      </div>
    </ChartFrame>
  );
}

const acaTreeFruit = [
  "arrogance", "feeling superior", "pettiness", "mistrust", "procrastination",
  "greed", "lust", "envy", "isolation", "perfectionism", "dishonesty",
  "addicted to excitement", "self-sacrificial", "approval seeking",
  "judgement", "self-centredness",
];

const acaTreeBranches = [
  "judging ourselves harshly",
  "stuffing our feelings",
  "afraid of people and authority",
  "confusing love and pity",
  "terrified of abandonment",
  "reactors rather than actors",
];

export function ACATreeChart() {
  return (
    <ChartFrame
      title="The Tree: Fear at the Root"
      subtitle={
        <>
          The behaviour everyone can see is the fruit. The traits that grow it are
          the branches. Underneath both, one root.
        </>
      }
      source={
        <>
          After the problem tree used in Adult Children of Alcoholics &amp;
          Dysfunctional Families literature; the branch traits are drawn from
          Tony A.'s Laundry List (1978). Cutting fruit off a tree does not change
          the tree.
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            The fruit — what shows
          </p>
          <p className="text-sm leading-relaxed">{acaTreeFruit.join(" · ")}</p>
        </div>
        <div className="flex justify-center text-muted-foreground" aria-hidden="true">
          ▲
        </div>
        <div className="rounded-md border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            The branches — the traits
          </p>
          <p className="text-sm leading-relaxed">{acaTreeBranches.join(" · ")}</p>
        </div>
        <div className="flex justify-center text-muted-foreground" aria-hidden="true">
          ▲
        </div>
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            The root
          </p>
          <p className="text-2xl font-semibold tracking-wide">FEAR</p>
        </div>
      </div>
    </ChartFrame>
  );
}

const coreSymptomRows = [
  {
    child: "Valuable",
    core: "Self-esteem",
    poles: "less-than ↔ better-than",
    secondary: "Negative control",
    relational: "Relational esteem",
  },
  {
    child: "Vulnerable",
    core: "Boundaries",
    poles: "too vulnerable ↔ invulnerable",
    secondary: "Resentment, raging",
    relational: "Enmeshment, avoidance",
  },
  {
    child: "Imperfect",
    core: "Reality",
    poles: "bad/rebellious ↔ good/perfect",
    secondary: "Spirituality",
    relational: "Dishonesty",
  },
  {
    child: "Dependent",
    core: "Dependency",
    poles: "too dependent ↔ needless",
    secondary: "Addiction, mood, illness",
    relational: "Interdependence",
  },
  {
    child: "Spontaneous",
    core: "Moderation",
    poles: "out of control ↔ controlling",
    secondary: "Intimacy",
    relational: "Intensity",
  },
];

export function CoreSymptomsChart() {
  return (
    <ChartFrame
      title="Five Things a Child Is, and What Happens When Each Is Injured"
      subtitle={
        <>
          Read a row left to right: the natural characteristic, the core symptom
          when it is damaged, the two directions that damage runs, and what it
          eventually costs in a relationship.
        </>
      }
      source={
        <>
          After Pia Mellody, <em>Facing Codependence</em> (Harper &amp; Row, 1989).
          Childhood trauma causes immaturity; both drive unmanageability; all three
          together produce the difficulty with intimacy.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="border-b border-border py-2 pr-3 font-semibold">The child is…</th>
              <th className="border-b border-border py-2 pr-3 font-semibold">Core symptom</th>
              <th className="border-b border-border py-2 pr-3 font-semibold">Which way it fails</th>
              <th className="border-b border-border py-2 pr-3 font-semibold">Secondary</th>
              <th className="border-b border-border py-2 font-semibold">In relationship</th>
            </tr>
          </thead>
          <tbody>
            {coreSymptomRows.map((r) => (
              <tr key={r.core}>
                <td className="border-b border-border/60 py-2 pr-3 font-medium">{r.child}</td>
                <td className="border-b border-border/60 py-2 pr-3">{r.core}</td>
                <td className="border-b border-border/60 py-2 pr-3 text-muted-foreground italic">
                  {r.poles}
                </td>
                <td className="border-b border-border/60 py-2 pr-3 text-muted-foreground">
                  {r.secondary}
                </td>
                <td className="border-b border-border/60 py-2 text-muted-foreground">
                  {r.relational}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFrame>
  );
}

const fourHorsemen = [
  {
    horseman: "Criticism",
    isnt: "A complaint. “You didn't take the bins out” is a complaint.",
    is: "An attack on character. “You never think about anyone but yourself.”",
    antidote: "Gentle start-up",
    how: "Say what you feel and what you need, about this one thing. Start with “I”, not “you always”.",
  },
  {
    horseman: "Contempt",
    isnt: "Anger. Anger is survivable.",
    is: "Superiority — mockery, eye-rolling, sneering, name-calling.",
    antidote: "A culture of appreciation",
    how: "Build the habit of noticing what they get right, out loud, when nothing is wrong.",
  },
  {
    horseman: "Defensiveness",
    isnt: "Disagreement.",
    is: "Reversing the blame. “Well if you hadn't…”",
    antidote: "Take responsibility",
    how: "Find the part that is yours — even 10% — and own that part without conditions.",
  },
  {
    horseman: "Stonewalling",
    isnt: "Needing a minute.",
    is: "Going blank and shutting down mid-conversation.",
    antidote: "Physiological self-soothing",
    how: "Say you are flooded, name a time to return, leave, and actually come back.",
  },
];

export function FourHorsemenChart() {
  return (
    <ChartFrame
      title="The Four Horsemen, and What Answers Each One"
      subtitle={
        <>
          Each has a near neighbour that is fine, and a specific antidote. The
          antidote is a behaviour, not an attitude.
        </>
      }
      source={
        <>
          Gottman, J. M., &amp; Silver, N. (1999). <em>The seven principles for making
          marriage work</em>. Crown. Of the four, contempt is the single strongest
          predictor of a relationship ending.
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fourHorsemen.map((h) => (
          <div key={h.horseman} className="rounded-md border border-border p-4">
            <p className="font-semibold text-base mb-2">{h.horseman}</p>
            <p className="text-xs text-muted-foreground mb-1">
              <span className="font-medium text-foreground/70">Not: </span>
              {h.isnt}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              <span className="font-medium text-foreground/70">Is: </span>
              {h.is}
            </p>
            <p className="text-sm font-medium text-primary">{h.antidote}</p>
            <p className="text-xs text-muted-foreground mt-1">{h.how}</p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

const boundaryRungs = [
  { step: "Inform", say: "“When you raise your voice I stop being able to hear you.”", note: "Most boundaries never need to go past here." },
  { step: "Request", say: "“I'm asking you not to raise your voice with me.”", note: "Still collaborative. Still assumes good faith." },
  { step: "Insist", say: "“I need this to stop.”", note: "The tone changes. The ask does not." },
  { step: "Walk away", say: "“I'm going to end this conversation now.”", note: "Not a threat and not a punishment — the consequence you already named, happening." },
];

export function BoundaryLadderChart() {
  return (
    <ChartFrame
      title="The Four Rungs of a Boundary"
      subtitle={
        <>
          You start at the bottom, every time. Skipping to the top is not a
          boundary, it is an ultimatum.
        </>
      }
      source={
        <>
          A boundary is clear, communicated, consistent, and carries a consequence
          that is <em>within your control</em>. If enforcing it requires the other
          person to cooperate, it is not a boundary — it is a request.
        </>
      }
    >
      <ol className="space-y-3">
        {boundaryRungs.map((r, i) => (
          <li key={r.step} className="flex gap-4 items-start">
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{r.step}</p>
              <p className="text-sm text-foreground/80 italic">{r.say}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </ChartFrame>
  );
}

export function AttachmentMapChart() {
  return (
    <ChartFrame
      title="Attachment Is a Position, Not a Verdict"
      subtitle={
        <>
          Four quadrants, and the only three points that matter: where you were,
          where you are, and where you are going.
        </>
      }
      source={
        <>
          Quadrants after Bartholomew, K., &amp; Horowitz, L. M. (1991),
          <em> Journal of Personality and Social Psychology, 61</em>(2), 226–244.
          Attachment style is measurably changeable in adulthood — the research
          term is <em>earned secure attachment</em>.
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 460 330"
          className="w-full min-w-[400px] h-auto"
          role="img"
          aria-labelledby="attach-title attach-desc"
        >
          <title id="attach-title">The attachment map with a path marked</title>
          <desc id="attach-desc">
            A two-by-two grid. Secure is top left, Anxious top right, Avoidant
            bottom left, Dismissive bottom right. Three marked points trace a
            path from deep in the anxious quadrant, part-way back, and on toward
            secure.
          </desc>
          <rect x="40" y="30" width="380" height="240" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <line x1="230" y1="30" x2="230" y2="270" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <line x1="40" y1="150" x2="420" y2="150" stroke="hsl(var(--border))" strokeWidth="1.5" />

          <g fill="hsl(var(--muted-foreground))" fontSize="14" fontWeight="600">
            <text x="56" y="52">Secure</text>
            <text x="246" y="52">Anxious</text>
            <text x="56" y="262">Avoidant</text>
            <text x="246" y="262">Dismissive</text>
          </g>

          <path
            d="M380 96 L300 118 L150 96"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="6 5"
            markerEnd=""
          />
          <circle cx="380" cy="96" r="6" fill="hsl(var(--muted-foreground))" />
          <circle cx="300" cy="118" r="7" fill="hsl(var(--primary))" />
          <circle cx="150" cy="96" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />

          <g fontSize="11" fill="hsl(var(--muted-foreground))">
            <text x="380" y="84" textAnchor="middle">where I was</text>
            <text x="300" y="140" textAnchor="middle" fill="hsl(var(--primary))" fontWeight="600">where I am</text>
            <text x="150" y="84" textAnchor="middle">where I'm going</text>
          </g>

          <text x="230" y="300" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontStyle="italic">
            earned security: the destination is a quadrant, not a personality
          </text>
        </svg>
      </div>
    </ChartFrame>
  );
}

const icebergs = [
  { above: "Rage", below: ["pain", "helplessness"] },
  { above: "Anger", below: ["sadness", "shame"] },
  { above: "Resentment", below: ["frustration", "discontent"] },
  { above: "Anxiety", below: ["guilt", "fear of loss"] },
];

export function CatastrophizingIcebergChart() {
  return (
    <ChartFrame
      title="What Shows, and What Is Underneath"
      subtitle={
        <>
          The feeling other people meet is almost never the feeling you are having.
          The visible one is the one that felt safe to have.
        </>
      }
      source={
        <>
          Anger and anxiety are frequently secondary — they sit on top of a primary
          feeling that was less permitted. Asking "what is under this?" is often
          more useful than trying to manage what is on top.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {icebergs.map((berg) => (
          <div key={berg.above} className="rounded-md border border-border overflow-hidden">
            <div className="bg-muted/60 px-3 py-4 text-center">
              <p className="font-semibold">{berg.above}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                above the water
              </p>
            </div>
            <div className="border-t-2 border-dashed border-primary/50" />
            <div className="px-3 py-4 text-center bg-primary/5">
              {berg.below.map((b) => (
                <p key={b} className="text-sm text-muted-foreground">{b}</p>
              ))}
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-2">
                below
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

/**
 * Replaces the book's one piece of ASCII art.
 *
 * It was a fenced code block, which three things did badly: the site set it in
 * the typography plugin's dark-block colour against a light background, at a
 * contrast ratio of 1.01; the PDF exporter dropped every fenced block on the
 * floor, so the central diagram of the CBT chapter was simply missing from the
 * printed book; and a screen reader got a column of slashes. Drawn properly it
 * survives all three, and it says more than the original did — the arrows run
 * both ways, which is the whole point of the model.
 */
export function CBTTriangleChart() {
  return (
    <ChartFrame
      title="The CBT Triangle"
      subtitle={
        <>
          Thoughts, feelings and behaviours, each one feeding the other two.
        </>
      }
      source={
        <>
          The cognitive model as set out in Beck, A. T. (1979). <em>Cognitive Therapy of
          Depression</em>. Guilford. The arrows run both ways on purpose: no corner is
          the cause of the others, which is why a change at any one of them moves
          the whole triangle.
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 520 320"
          className="w-full min-w-[420px] h-auto"
          role="img"
          aria-labelledby="cbt-triangle-title cbt-triangle-desc"
        >
          <title id="cbt-triangle-title">The CBT triangle</title>
          <desc id="cbt-triangle-desc">
            Thoughts sit at the top, feelings at the bottom left, behaviours at
            the bottom right. Each corner is joined to the other two by an arrow
            pointing in both directions: thoughts shape feelings and feelings
            shape thoughts, thoughts drive behaviour and behaviour confirms
            thoughts, and feelings drive behaviour while behaviour changes
            feelings. Thoughts are what you think, feelings what you feel, and
            behaviours what you do.
          </desc>

          <defs>
            <marker
              id="cbt-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
            </marker>
          </defs>

          {/* Each side is a single line arrowed at both ends: no corner causes
              the others, and drawing one-way arrows would say that it did. */}
          <g
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            markerStart="url(#cbt-arrow)"
            markerEnd="url(#cbt-arrow)"
          >
            <line x1="238" y1="96" x2="118" y2="216" />
            <line x1="282" y1="96" x2="402" y2="216" />
            <line x1="150" y1="243" x2="370" y2="243" />
          </g>

          <g textAnchor="middle" fill="hsl(var(--foreground))" fontSize="16" fontWeight="600">
            <text x="260" y="42">THOUGHTS</text>
            <text x="96" y="272">FEELINGS</text>
            <text x="424" y="272">BEHAVIOURS</text>
          </g>
          <g textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
            <text x="260" y="60">(cognitions)</text>
            <text x="96" y="290">(emotions)</text>
            <text x="424" y="290">(actions)</text>
          </g>
          <g textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12" fontStyle="italic">
            <text x="260" y="78">“what I think”</text>
            <text x="96" y="308">“what I feel”</text>
            <text x="424" y="308">“what I do”</text>
          </g>
        </svg>
      </div>
    </ChartFrame>
  );
}

export function CoreBeliefCycleChart() {
  const nodes = [
    { label: "Negative core belief", detail: "“I'm not worth anything.”" },
    { label: "Rules and assumptions", detail: "“So I must never need anything from anyone.”" },
    { label: "Behaviour", detail: "Withdraw. Don't ask. Handle it alone." },
    { label: "Other people's response", detail: "They leave you to it. They stop offering." },
    { label: "Evidence", detail: "“See — nobody was there.”" },
  ];
  return (
    <ChartFrame
      title="Why a Core Belief Never Runs Out of Proof"
      subtitle={
        <>
          The belief produces the behaviour, the behaviour produces the response,
          and the response is filed as evidence for the belief.
        </>
      }
      source={
        <>
          The maintenance cycle in cognitive therapy. Note where the loop is
          breakable: not at the belief, which will not argue, but at step 3 —
          the behaviour is the only node you directly control.
        </>
      }
    >
      <ol className="space-y-2">
        {nodes.map((n, i) => (
          <li key={n.label}>
            <div className="flex gap-3 items-start">
              <span
                className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-sm">{n.label}</p>
                <p className="text-sm text-muted-foreground italic">{n.detail}</p>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className="ml-3 h-3 border-l-2 border-border" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 pl-9 text-sm text-primary font-medium">
        ↻ and back to 1, now better supported than it was
      </p>
    </ChartFrame>
  );
}

const askIntensity = [
  { n: 1, ask: "Don't ask. Don't hint.", no: "Do it without being asked." },
  { n: 2, ask: "Hint indirectly. Take no.", no: "Don't complain. Do it cheerfully." },
  { n: 3, ask: "Hint openly. Take no.", no: "Do it, even without cheer." },
  { n: 4, ask: "Ask tentatively. Take no.", no: "Do it, but show you'd rather not." },
  { n: 5, ask: "Ask gracefully. Take no.", no: "Say you'd rather not, but do it gracefully." },
  { n: 6, ask: "Ask confidently. Take no.", no: "Say no confidently — but reconsider." },
  { n: 7, ask: "Ask confidently. Resist no.", no: "Say no confidently. Resist saying yes." },
  { n: 8, ask: "Ask firmly. Resist no.", no: "Say no firmly. Resist saying yes." },
  { n: 9, ask: "Ask firmly. Negotiate. Keep trying.", no: "Say no firmly. Negotiate. Keep trying." },
  { n: 10, ask: "Ask and don't take no for an answer.", no: "Don't do it." },
];

export function AskIntensityChart() {
  return (
    <ChartFrame
      title="How Hard to Ask, and How Hard to Refuse"
      subtitle={
        <>
          Not <em>whether</em> to ask — how intensely. Most people own two or three
          of these ten settings and use them for everything.
        </>
      }
      source={
        <>
          Linehan, M. M. (2015). <em>DBT skills training handouts and worksheets</em>
          (2nd ed.). Guilford Press. Intensity is chosen from the situation — how
          capable you are, how urgent it is, the relationship, your own priorities
          and self-respect — not from how frightened you feel.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="border-b border-border py-2 pr-3 w-10 font-semibold">#</th>
              <th className="border-b border-border py-2 pr-4 font-semibold">Asking for something</th>
              <th className="border-b border-border py-2 font-semibold">Saying no</th>
            </tr>
          </thead>
          <tbody>
            {askIntensity.map((r) => (
              <tr key={r.n}>
                <td className="border-b border-border/60 py-1.5 pr-3 font-mono text-muted-foreground">
                  {r.n}
                </td>
                <td className="border-b border-border/60 py-1.5 pr-4">{r.ask}</td>
                <td className="border-b border-border/60 py-1.5 text-muted-foreground">{r.no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFrame>
  );
}

const dialecticPairs = [
  { a: "Reasonable mind", b: "Emotional mind", syn: "Decide with values and experience both in the room" },
  { a: "Doing mind", b: "Nothing-to-do mind", syn: "Do what the moment needs, and be in it" },
  { a: "Wanting change", b: "Radical acceptance", syn: "Want it to be different and accept that it is not" },
  { a: "Self-denial", b: "Self-indulgence", syn: "Moderation that still satisfies the senses" },
  { a: "Doing too much", b: "Doing too little", syn: "Enough" },
];

export function MiddlePathChart() {
  return (
    <ChartFrame
      title="Walking the Middle Path"
      subtitle={
        <>
          Not a compromise between the two poles, and not picking one. A third
          thing that holds both at once.
        </>
      }
      source={
        <>
          Linehan, M. M. (2015). A platypus lays eggs and has a bill,
          <em> and</em> is a mammal that produces milk. Two things can be true at once.
        </>
      }
    >
      <div className="space-y-2">
        {dialecticPairs.map((p) => (
          <div
            key={p.a}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center rounded-md border border-border p-3"
          >
            <p className="text-sm text-right sm:text-right font-medium">{p.a}</p>
            <p className="text-center text-primary font-semibold text-sm" aria-hidden="true">
              ⟷
            </p>
            <p className="text-sm font-medium">{p.b}</p>
            <p className="sm:col-span-3 text-xs text-muted-foreground italic border-t border-border/60 pt-2 mt-1">
              {p.syn}
            </p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

// Angles are measured anticlockwise from east, to match the quadrant labels:
// work top-left, leisure top-right, relationships bottom-left, growth bottom-right.
const bullseyeDomains = [
  { domain: "Work / education", angle: 135, distance: 0.3 },
  { domain: "Leisure", angle: 45, distance: 0.55 },
  { domain: "Relationships", angle: 225, distance: 0.85 },
  { domain: "Personal growth / health", angle: 315, distance: 0.8 },
];

export function BullseyeChart() {
  const cx = 170;
  const cy = 170;
  const R = 130;
  return (
    <ChartFrame
      title="The Bullseye"
      subtitle={
        <>
          Four domains. In each one, mark how close your actual behaviour is to the
          person you want to be. The centre is not perfection — it is congruence.
        </>
      }
      source={
        <>
          Lundgren, T., et al. (2012). The Bull's-Eye Values Survey: A psychometric
          evaluation. <em>Cognitive and Behavioral Practice, 19</em>(4), 518–526.
          A dot near the edge is information, not a verdict.
        </>
      }
    >
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <svg
          viewBox="0 0 340 340"
          className="w-full max-w-[320px] h-auto shrink-0"
          role="img"
          aria-labelledby="bullseye-title bullseye-desc"
        >
          <title id="bullseye-title">A bullseye divided into four life domains</title>
          <desc id="bullseye-desc">
            Concentric rings quartered into work and education, relationships,
            personal growth and health, and leisure. A mark in each quadrant
            shows how far current behaviour sits from the centre. In this
            example, work is close to the centre, leisure is mid-way, and
            relationships and personal growth are near the outer edge.
          </desc>
          {[1, 0.75, 0.5, 0.25].map((r, i) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={R * r}
              fill={i % 2 === 0 ? "hsl(var(--muted))" : "hsl(var(--card))"}
              fillOpacity={0.5}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}
          <circle cx={cx} cy={cy} r={R * 0.1} fill="hsl(var(--primary))" fillOpacity="0.25" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="hsl(var(--border))" strokeWidth="1" />

          {bullseyeDomains.map((d) => {
            const rad = (d.angle * Math.PI) / 180;
            const x = cx + Math.cos(rad) * R * d.distance;
            const y = cy - Math.sin(rad) * R * d.distance;
            return <circle key={d.domain} cx={x} cy={y} r="6" fill="hsl(var(--primary))" />;
          })}

          <g fontSize="10.5" fill="hsl(var(--muted-foreground))">
            <text x={cx - R + 4} y={cy - R + 14}>work / education</text>
            <text x={cx + R - 4} y={cy - R + 14} textAnchor="end">leisure</text>
            <text x={cx - R + 4} y={cy + R - 6}>relationships</text>
            <text x={cx + R - 4} y={cy + R - 6} textAnchor="end">growth / health</text>
          </g>
        </svg>
        <div className="text-sm space-y-3">
          <p>
            <span className="font-medium">At the centre:</span>{" "}
            <span className="text-muted-foreground">
              “I am behaving like the person I want to be.”
            </span>
          </p>
          <p>
            <span className="font-medium">At the edge:</span>{" "}
            <span className="text-muted-foreground">
              “My behaviour is far removed from the way I'd like to be.”
            </span>
          </p>
          <p className="text-muted-foreground">
            Then the only question that matters:{" "}
            <span className="text-foreground font-medium">
              what do I need to do to be closer to the centre?
            </span>
          </p>
        </div>
      </div>
    </ChartFrame>
  );
}

const fearDare = [
  { f: "Fusion", d: "Defusion", fWhat: "Being welded to a thought, so it is not a thought — it is just how things are.", dWhat: "Seeing the thought as a thought. Naming it, and letting it be there without obeying it." },
  { f: "Excessive goals", d: "Realistic goals", fWhat: "Goals too big for the resources, skills or time you actually have.", dWhat: "Break it down until the first step is genuinely possible this week." },
  { f: "Avoidance of discomfort", d: "Acceptance of discomfort", fWhat: "Unwillingness to feel what moving forward would make you feel.", dWhat: "Make room for it. Not liking it — allowing it." },
  { f: "Remoteness from values", d: "Embracing values", fWhat: "Losing contact with why any of this was supposed to matter.", dWhat: "Reconnect to what you actually care about, in words, out loud." },
];

export function FearDareChart() {
  return (
    <ChartFrame
      title="FEAR, and What to DARE Instead"
      subtitle={
        <>
          Four ways forward motion stops, each with its counterpart. When you are
          stuck, one of these four is usually the reason.
        </>
      }
      source={
        <>
          Harris, R. (2019). <em>ACT made simple</em> (2nd ed.). New Harbinger
          Publications.
        </>
      }
    >
      <div className="space-y-3">
        {fearDare.map((r) => (
          <div key={r.f} className="grid gap-3 md:grid-cols-2 rounded-md border border-border p-4">
            <div>
              <p className="font-semibold text-destructive text-sm">{r.f}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.fWhat}</p>
            </div>
            <div className="md:border-l md:border-border md:pl-4">
              <p className="font-semibold text-primary text-sm">{r.d}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.dWhat}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

export function AddictiveSystemChart() {
  const inner = [
    { phase: "Preoccupation", note: "The mind starts to hunt. Everything becomes a cue." },
    { phase: "Ritualisation", note: "The routines before. Often more charged than the act." },
    { phase: "Compulsive behaviour", note: "The act itself. Usually the briefest part." },
    { phase: "Despair", note: "Shame, and powerlessness — which is the fuel for the next cycle." },
  ];
  return (
    <ChartFrame
      title="The Cycle Inside the System"
      subtitle={
        <>
          Four phases that feed each other, sitting inside a larger loop of belief
          and unmanageability.
        </>
      }
      source={
        <>
          Carnes, P. J. (2001). <em>Out of the Shadows: Understanding sexual
          addiction</em> (3rd ed.). Hazelden. Despair is not the end of the cycle —
          it is what powers the next one.
        </>
      }
    >
      <div className="rounded-md border border-dashed border-border p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground text-center mb-3">
          negative core beliefs → belief system → impaired thinking ↓
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {inner.map((p, i) => (
            <li key={p.phase} className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold">
                <span className="text-primary mr-1.5">{i + 1}.</span>
                {p.phase}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{p.note}</p>
            </li>
          ))}
        </ol>
        <p className="text-xs uppercase tracking-wide text-muted-foreground text-center mt-3">
          ↑ unmanageability → back to the belief system
        </p>
      </div>
    </ChartFrame>
  );
}

export function ThreeCirclesGuideChart() {
  const circles = [
    {
      name: "Inner circle",
      colour: "border-destructive/50 bg-destructive/5",
      label: "Bottom line",
      text: "The behaviours that are, for you, the equivalent of a drink. No exceptions and no gradations. If it is in here, doing it is a relapse.",
      test: "Would I have to lie about this?",
    },
    {
      name: "Middle circle",
      colour: "border-chart-4/50 bg-muted/50",
      label: "Warning signs",
      text: "Not relapse. The conditions that reliably precede it. Isolation, skipped meetings, poor sleep, secrecy, the slide in self-care.",
      test: "Is this how it started last time?",
    },
    {
      name: "Outer circle",
      colour: "border-primary/50 bg-primary/5",
      label: "The life being built",
      text: "Everything that constitutes recovery rather than merely abstinence. This circle is the point. The other two exist to protect it.",
      test: "Does this make the life I want more likely?",
    },
  ];
  return (
    <ChartFrame
      title="The Three Circles"
      subtitle={
        <>
          A sobriety definition you write yourself, because unlike alcohol there is
          no substance to abstain from.
        </>
      }
      source={
        <>
          Used across Sex Addicts Anonymous and related fellowships; see
          Carnes, P. J. (2001). Write it with a sponsor or a therapist, not alone —
          the inner circle is exactly where the disease gets a vote.
        </>
      }
    >
      <div className="space-y-3">
        {circles.map((c) => (
          <div key={c.name} className={`rounded-md border p-4 ${c.colour}`}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">{c.text}</p>
            <p className="text-sm mt-2">
              <span className="text-muted-foreground">The test: </span>
              <span className="italic">{c.test}</span>
            </p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

// ─── Relapse prevention, mutual aid, and the daily plan ──────────────────────

const relapsePrecipitantData = [
  { situation: "Negative emotional states", share: 35 },
  { situation: "Social pressure", share: 20 },
  { situation: "Interpersonal conflict", share: 16 },
  { situation: "Everything else", share: 29 },
];

const relapsePrecipitantConfig: ChartConfig = {
  share: { label: "Share of relapse episodes (%)", color: "hsl(var(--chart-1))" },
};

export function RelapsePrecipitantsChart() {
  return (
    <ChartFrame
      data={relapsePrecipitantData}
      config={relapsePrecipitantConfig}
      title="What Actually Precedes a Relapse"
      subtitle="Situations reported at the point of first use, across substances"
      source={
        <>
          Marlatt's relapse-precipitant taxonomy, as reported in Cummings, C.,
          Gordon, J. R., &amp; Marlatt, G. A. (1980) and developed in Marlatt, G. A.,
          &amp; Gordon, J. R. (1985). <em>Relapse Prevention</em>. Guilford Press.
          Proportions vary by substance and sample; the ordering is the robust
          finding, not the exact figures.
        </>
      }
    >
      <ChartContainer config={relapsePrecipitantConfig} className="h-[260px] w-full">
        <BarChart
          layout="vertical"
          data={relapsePrecipitantData}
          margin={{ top: 8, right: 44, bottom: 5, left: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 40]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="situation" width={160} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar isAnimationActive={!staticCharts} dataKey="share" fill="var(--color-share)" radius={4}>
            <LabelList
              dataKey="share"
              position="right"
              formatter={percentLabel}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  );
}

export function StagesOfChangeChart() {
  const stages = [
    {
      n: 1,
      name: "Precontemplation",
      inside: "There is no problem, or the problem is everyone else.",
      helps: "Information without argument. Pushing here produces defence, not change.",
    },
    {
      n: 2,
      name: "Contemplation",
      inside: "I can see it. I am not ready. Both of those are true at once.",
      helps: "Ambivalence explored rather than resolved for you — a cost–benefit sheet, not a lecture.",
    },
    {
      n: 3,
      name: "Preparation",
      inside: "I am going to do something, and I am working out what.",
      helps: "A date, a first appointment, a phone number in your pocket. Small commitments made out loud.",
    },
    {
      n: 4,
      name: "Action",
      inside: "The behaviour has changed and it is taking everything I have.",
      helps: "Structure, substitution, and people who have done it. This stage is expensive; plan for that.",
    },
    {
      n: 5,
      name: "Maintenance",
      inside: "The change is holding, and the risk is now complacency rather than craving.",
      helps: "The relapse-prevention plan itself. Maintenance is where a written plan earns its keep.",
    },
  ];
  return (
    <ChartFrame
      title="The Stages of Change"
      subtitle="Change as a cycle people move around, usually more than once"
      source={
        <>
          Prochaska, J. O., &amp; DiClemente, C. C. (1983). Stages and processes of
          self-change of smoking. <em>Journal of Consulting and Clinical Psychology,
          51</em>(3), 390–395. The model is descriptive: knowing which stage you are in
          tells you what kind of help will land, not how long it will take.
        </>
      }
    >
      <div className="space-y-2.5">
        {stages.map((s) => (
          <div key={s.n} className="flex gap-3 rounded-md border bg-card p-3.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {s.n}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-sm italic text-muted-foreground">“{s.inside}”</p>
              <p className="mt-1.5 text-sm">
                <span className="text-muted-foreground">What helps here: </span>
                {s.helps}
              </p>
            </div>
          </div>
        ))}
        <div className="rounded-md border border-dashed bg-muted/40 p-3.5">
          <p className="text-sm">
            <span className="font-semibold">Recurrence returns you to the cycle, not to the
            start.</span>{" "}
            Prochaska and DiClemente drew this as a wheel for a reason. Most people go round
            it several times, and each pass usually begins further along than the last one
            did. A return to use is information about which stage the plan was actually in —
            not proof that none of it counted.
          </p>
        </div>
      </div>
    </ChartFrame>
  );
}

export function ThreeStagesOfRelapseChart() {
  const stages = [
    {
      name: "Emotional relapse",
      when: "Weeks or months out",
      tone: "border-primary/40 bg-primary/5",
      signs:
        "Not thinking about using at all. Bottling things up, isolating, skipping meetings or going and not speaking, poor sleep, poor eating, self-care sliding.",
      doing:
        "Name it as a stage rather than a bad patch. The intervention here is small and boring: sleep, food, one phone call, one meeting where you actually talk.",
    },
    {
      name: "Mental relapse",
      when: "Days to weeks out",
      tone: "border-chart-4/50 bg-chart-4/5",
      signs:
        "A war inside. Craving, romanticising past use, minimising consequences, lying, hunting for a situation where it would be possible, bargaining and planning.",
      doing:
        "Tell someone within the hour — secrecy is the fuel. Play the tape forward past the first drink. Wait it out: urges peak and pass in minutes, not hours.",
    },
    {
      name: "Physical relapse",
      when: "The event",
      tone: "border-destructive/50 bg-destructive/5",
      signs:
        "The drink, the drug, the behaviour. By the time you are here the decisions that mattered were made in the two stages above.",
      doing:
        "Get help the same day, not once you have tidied it up. The gap between the lapse and the phone call is where a lapse becomes a run.",
    },
  ];
  return (
    <ChartFrame
      title="Relapse Happens in Three Stages"
      subtitle="It starts long before anybody picks anything up"
      source={
        <>
          Melemis, S. M. (2015). Relapse prevention and the five rules of recovery.{" "}
          <em>Yale Journal of Biology and Medicine, 88</em>(3), 325–332; the staged
          model follows Gorski's earlier work on relapse warning signs.
        </>
      }
    >
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div key={s.name} className={`rounded-md border p-4 ${s.tone}`}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="font-semibold">
                {i + 1}. {s.name}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.when}</p>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.signs}</p>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">What to do: </span>
              {s.doing}
            </p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

export function UrgeEscalationChart() {
  const steps = [
    {
      name: "Thought",
      body: "A cue lands — a street, a song, a face, an hour of the day. At this point it is only a thought, and it costs nothing to let it go past.",
      exit: "Notice and name it. “That is a thought about using.” Then change what you are doing.",
    },
    {
      name: "Craving",
      body: "The thought was allowed to run and has picked up a body: warmth, restlessness, a pull toward somewhere specific.",
      exit: "Ride it rather than fight it. Time it — most cravings crest inside twenty minutes. Call someone while it crests.",
    },
    {
      name: "Urge",
      body: "The felt sense that you absolutely must. Not a fact, but it is very good at impersonating one.",
      exit: "Put distance and people between you and the substance. This is what the crisis column of your plan is for.",
    },
  ];
  return (
    <ChartFrame
      title="Thought → Craving → Urge"
      subtitle="Three points to get off, and they get harder in that order"
      source={
        <>
          The escalation is SMART Recovery's; see SMART Recovery (2008).{" "}
          <em>Members' Handbook</em>, and Horvath, A. T., &amp; Yeterian, J. (2012).
          SMART Recovery: Self-empowering, science-based addiction recovery support.{" "}
          <em>Journal of Groups in Addiction &amp; Recovery, 7</em>(2–4), 102–117.
        </>
      }
    >
      <div className="space-y-2.5">
        {steps.map((s, i) => (
          <div key={s.name}>
            <div className="rounded-md border bg-card p-3.5">
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Getting off here: </span>
                {s.exit}
              </p>
            </div>
            {i < steps.length - 1 ? (
              <p className="py-1 text-center text-lg leading-none text-muted-foreground" aria-hidden="true">
                ↓
              </p>
            ) : null}
          </div>
        ))}
        <p className="pt-1 text-sm text-muted-foreground">
          Every urge you have ever had has ended. That is not encouragement, it is
          arithmetic — you are still here, so every one of them passed.
        </p>
      </div>
    </ChartFrame>
  );
}

export function SmartFourPointChart() {
  const points = [
    {
      n: 1,
      name: "Building and maintaining motivation",
      tools: "Cost–benefit analysis · hierarchy of values · change plan",
      body: "Motivation is treated as something you construct and top up on purpose, not a mood you wait for.",
    },
    {
      n: 2,
      name: "Coping with urges",
      tools: "Urge surfing · DISARM · distraction and delay",
      body: "An urge is a sensation with a shelf life, and the programme drills the specific moves that outlast one.",
    },
    {
      n: 3,
      name: "Managing thoughts, feelings and behaviours",
      tools: "The ABC · disputing demands · unconditional self-acceptance",
      body: "Straight rational emotive behaviour therapy: the belief in the middle is what turns an event into a consequence.",
    },
    {
      n: 4,
      name: "Living a balanced life",
      tools: "Values clarification · goal setting · lifestyle planning",
      body: "The programme's own answer to what abstinence is for. Empty time is a risk factor, so the calendar is part of the treatment.",
    },
  ];
  return (
    <ChartFrame
      title="SMART Recovery's Four-Point Program"
      subtitle="A cognitive-behavioural alternative to the twelve steps, with tools rather than steps"
      source={
        <>
          SMART Recovery (2008). <em>Members' Handbook</em>. Self Management And
          Recovery Training; Horvath, A. T., &amp; Yeterian, J. (2012).{" "}
          <em>Journal of Groups in Addiction &amp; Recovery, 7</em>(2–4), 102–117.
          The four points are worked in any order and revisited, unlike the twelve
          steps, which are worked through.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {points.map((p) => (
          <div key={p.n} className="rounded-md border bg-card p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-primary">{p.n}</span>
              <p className="font-semibold leading-snug">{p.name}</p>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {p.tools}
            </p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

export function MutualAidComparisonChart() {
  const rows = [
    {
      programme: "AA / NA",
      problem: "A disease of body, mind and spirit; powerlessness is the starting admission",
      change: "A higher power, the twelve steps, sponsorship and service",
      shape: "Open and closed meetings, readings, shares, no cross-talk; lifelong",
    },
    {
      programme: "SMART Recovery",
      problem: "A learned, changeable behaviour maintained by beliefs and reinforcement",
      change: "Self-management: REBT and CBT tools worked with a trained facilitator",
      shape: "Facilitated discussion around an agenda and a whiteboard; graduation expected",
    },
    {
      programme: "Celebrate Recovery",
      problem: "A hurt, hang-up or habit — deliberately wider than substances",
      change: "Explicitly Christian: eight principles from the Beatitudes, mapped onto the twelve steps",
      shape: "Large-group teaching then small groups by issue and gender; church-hosted",
    },
    {
      programme: "Refuge Recovery",
      problem: "Craving and the suffering it produces, framed by the Four Noble Truths",
      change: "Buddhist practice — meditation, inventory, an eightfold path adapted to recovery",
      shape: "Meditation then reading and sharing; secular in tone, Buddhist in structure",
    },
  ];
  return (
    <ChartFrame
      title="Four Mutual-Aid Programmes, Side by Side"
      subtitle="They disagree about the mechanism and agree about the room"
      source={
        <>
          Compiled from each programme's own literature. On effectiveness, the
          strongest evidence is for manualised twelve-step facilitation: Kelly, J. F.,
          Humphreys, K., &amp; Ferri, M. (2020). Alcoholics Anonymous and other
          12-step programs for alcohol use disorder. <em>Cochrane Database of
          Systematic Reviews</em>, 3, CD012880. The others have far less trial
          evidence, which is a statement about how much research has been done, not a
          finding that they do not work.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <caption className="sr-only">
            Comparison of AA/NA, SMART Recovery, Celebrate Recovery and Refuge Recovery by
            how each frames the problem, where change is said to come from, and what a
            meeting looks like.
          </caption>
          <thead>
            <tr className="border-b text-left align-bottom">
              <th scope="col" className="py-2 pr-3 font-semibold">Programme</th>
              <th scope="col" className="py-2 pr-3 font-semibold">The problem is…</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Change comes from…</th>
              <th scope="col" className="py-2 font-semibold">A meeting looks like</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.programme} className="border-b last:border-0 align-top">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                  {r.programme}
                </th>
                <td className="py-2.5 pr-3 text-muted-foreground">{r.problem}</td>
                <td className="py-2.5 pr-3 text-muted-foreground">{r.change}</td>
                <td className="py-2.5 text-muted-foreground">{r.shape}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Trying more than one is normal and costs nothing. The variable that predicts
        benefit best is not which programme you pick — it is whether you keep turning up.
      </p>
    </ChartFrame>
  );
}

export function EightPrinciplesChart() {
  const rows = [
    { n: 1, word: "Realise", principle: "I am not God, and my life is unmanageable", steps: "1" },
    { n: 2, word: "Earnestly believe", principle: "That God exists and can help me recover", steps: "2" },
    { n: 3, word: "Consciously choose", principle: "To commit my life and will to his care", steps: "3" },
    { n: 4, word: "Openly examine", principle: "And confess my faults to myself, to God and to someone I trust", steps: "4–5" },
    { n: 5, word: "Voluntarily submit", principle: "To the changes and ask for my defects to be removed", steps: "6–7" },
    { n: 6, word: "Evaluate", principle: "All my relationships; forgive, and make amends where I did harm", steps: "8–9" },
    { n: 7, word: "Reserve", principle: "A daily time for self-examination, reading and prayer", steps: "10–11" },
    { n: 8, word: "Yield", principle: "Myself to carry this to others, by example and by word", steps: "12" },
  ];
  return (
    <ChartFrame
      title="Eight Principles, Twelve Steps"
      subtitle="How Celebrate Recovery's principles map onto the steps they were built from"
      source={
        <>
          Warren, R. Celebrate Recovery's eight recovery principles, drawn from the
          Beatitudes (Matthew 5) and aligned to the twelve steps of Alcoholics
          Anonymous. Paraphrased here; the wording is Saddleback Church's. The initials
          of the eight spell RECOVERY, which is the point of the ordering.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            The eight Celebrate Recovery principles with the twelve-step numbers each
            corresponds to.
          </caption>
          <thead>
            <tr className="border-b text-left">
              <th scope="col" className="py-2 pr-3 font-semibold">#</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Principle</th>
              <th scope="col" className="py-2 font-semibold">Steps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className="border-b last:border-0 align-top">
                <th scope="row" className="py-2 pr-3 text-left font-medium">{r.n}</th>
                <td className="py-2 pr-3">
                  <span className="font-medium">{r.word}</span>{" "}
                  <span className="text-muted-foreground">{r.principle}</span>
                </td>
                <td className="py-2 tabular-nums text-muted-foreground">{r.steps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFrame>
  );
}

export function DailyPracticeChart() {
  const domains = [
    {
      name: "Mental",
      items: ["A deliberately positive frame for the day", "Recovery-centred reading or a podcast"],
      why: "Sets what the mind is chewing on before the day sets it for you.",
    },
    {
      name: "Physical",
      items: ["Wake at a fixed time", "Move — anything", "Water", "Eat something"],
      why: "The four that get skipped first, and skipping them is itself a warning sign.",
    },
    {
      name: "Spiritual",
      items: [
        "Meditate",
        "The Serenity Prayer",
        "Step prayers, or whatever your equivalent is",
        "Look at the stars",
        "Stand barefoot on the ground",
        "Listen to water or to wind",
      ],
      why: "Half of these have no theology in them at all. They point attention outward, which is the whole job of this row.",
    },
    {
      name: "Connection",
      items: [
        "Talk to peers in recovery",
        "Send a message to somebody who is struggling",
        "Phone another person in recovery",
        "Go to a meeting",
      ],
      why: "The row that notices when you go quiet. Nothing else on the page can do that.",
    },
  ];
  return (
    <ChartFrame
      title="What One Day Contains"
      subtitle="A daily routine across four domains — small enough to survive a bad morning"
      source={
        <>
          The author's own daily routine during and after treatment. Each item is
          deliberately trivial: willpower is exactly what is missing on the days the
          routine matters most, so nothing here is allowed to require any.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {domains.map((d) => (
          <div key={d.name} className="rounded-md border bg-card p-4">
            <p className="font-semibold">{d.name}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {d.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-muted-foreground" aria-hidden="true">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-xs text-muted-foreground">{d.why}</p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

export function AmendsKindsChart() {
  const kinds = [
    {
      name: "Direct",
      tone: "border-primary/40 bg-primary/5",
      what: "Going to the person, naming the specific harm without excusing it, and asking what would put it right.",
      when: "The default. Most amends are this, and most of the dread beforehand is out of proportion to how they actually go.",
      note: "Not an apology. An apology is words about how you feel; an amends is a change and, where possible, a repair.",
    },
    {
      name: "Indirect",
      tone: "border-chart-4/50 bg-chart-4/5",
      what: "Repair made to someone else, or to the world, when the person is dead, unreachable, or would be harmed by contact.",
      when: "When a direct approach is impossible — or when it would serve you at their expense.",
      note: "Paying a debt to a charity because the creditor cannot be found still pays the debt. The point is restitution, not absolution.",
    },
    {
      name: "Living",
      tone: "border-chart-2/50 bg-muted/50",
      what: "A sustained change in conduct toward the person, or toward the class of people you harmed, carried out over years.",
      when: "Where the harm was chronic rather than a single event — most family harm is this kind.",
      note: "The only sort you cannot finish in an afternoon, and the only sort that convinces anybody who watched the last ten years.",
    },
  ];
  return (
    <ChartFrame
      title="Three Kinds of Amends"
      subtitle="Direct is the default, and it is not the only one"
      source={
        <>
          The ninth step of Alcoholics Anonymous — "made direct amends to such people
          wherever possible, except when to do so would injure them or others" — and
          the practice that has grown around it. On what the process does for the
          person making them, see Seperack, A. (2012). <em>The process of making
          amends in the Alcoholics Anonymous program: A qualitative study</em>
          (master's thesis, University of Rhode Island).
        </>
      }
    >
      <div className="space-y-3">
        {kinds.map((k) => (
          <div key={k.name} className={`rounded-md border p-4 ${k.tone}`}>
            <p className="font-semibold">{k.name} amends</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{k.what}</p>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">When: </span>
              {k.when}
            </p>
            <p className="mt-1.5 text-sm italic text-muted-foreground">{k.note}</p>
          </div>
        ))}
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm">
            <span className="font-semibold">
              “Except when to do so would injure them or others.”
            </span>{" "}
            That clause is not a loophole and it is not optional. An amends that
            transfers your discomfort onto somebody who has already been harmed by you
            is not an amends — it is one more thing done to them for your benefit.
            Disclosing an affair to a spouse who did not know, contacting someone who
            asked you never to, telling a child something they cannot carry: those are
            confessions, and they belong with a sponsor or a therapist, not with the
            person you hurt. Work the list with someone else before you work it with
            them.
          </p>
        </div>
      </div>
    </ChartFrame>
  );
}
