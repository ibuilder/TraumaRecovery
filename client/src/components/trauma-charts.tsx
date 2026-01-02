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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">PTSD Prevalence by Population</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Lifetime PTSD prevalence rates across different populations (WHO, 2024; VA, 2024)
      </p>
      <ChartContainer config={ptsdConfig} className="h-[300px] w-full">
        <BarChart data={ptsdPrevalenceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="group" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="prevalence" fill="var(--color-prevalence)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Adverse Childhood Experiences (ACEs) Distribution</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Percentage of U.S. adults by number of ACEs experienced (CDC, 2024)
      </p>
      <ChartContainer config={acesConfig} className="h-[300px] w-full">
        <BarChart data={acesPrevalenceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="aces" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Natural PTSD Recovery Timeline</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Percentage of individuals who recover from PTSD over time (WHO World Mental Health Surveys)
      </p>
      <ChartContainer config={recoveryConfig} className="h-[300px] w-full">
        <LineChart data={recoveryTimelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="months" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="recovered" stroke="var(--color-recovered)" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Trauma-Addiction Connection</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relationship between trauma exposure and substance use disorders (NIDA, 2025)
      </p>
      <ChartContainer config={addictionConfig} className="h-[300px] w-full">
        <BarChart data={traumaAddictionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="category" width={180} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Trauma Therapy Effectiveness</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Effect sizes (Cohen's d) for evidence-based trauma treatments (Meta-analyses, 2024)
      </p>
      <ChartContainer config={therapyConfig} className="h-[300px] w-full">
        <BarChart data={therapyEffectivenessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="therapy" />
          <YAxis domain={[0, 2]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="effectSize" fill="var(--color-effectSize)" radius={4} />
        </BarChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Note: Effect size interpretation: 0.2 = small, 0.5 = medium, 0.8+ = large
      </p>
    </div>
  );
}

const attachmentStylesData = [
  { style: "Secure", percentage: 60 },
  { style: "Avoidant", percentage: 15 },
  { style: "Anxious", percentage: 15 },
  { style: "Disorganized", percentage: 10 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent-foreground))", "hsl(var(--destructive))"];

const attachmentConfig: ChartConfig = {
  percentage: {
    label: "Population (%)",
    color: "hsl(var(--primary))",
  },
};

export function AttachmentStylesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Attachment Style Distribution</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Population distribution of attachment patterns in general population
      </p>
      <ChartContainer config={attachmentConfig} className="h-[300px] w-full">
        <PieChart>
          <Pie
            data={attachmentStylesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="percentage"
            nameKey="style"
          >
            {attachmentStylesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
};

export function ACEsHealthRiskChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">ACEs and Health Risk Increase</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relative risk increase for adults with 4+ ACEs vs 0 ACEs (CDC-Kaiser ACE Study)
      </p>
      <ChartContainer config={acesHealthConfig} className="h-[300px] w-full">
        <BarChart data={acesHealthData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="condition" angle={-45} textAnchor="end" height={80} />
          <YAxis tickFormatter={(v) => `${v}x`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="risk0ACEs" fill="var(--color-risk0ACEs)" radius={4} />
          <Bar dataKey="risk4ACEs" fill="var(--color-risk4ACEs)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Post-Traumatic Growth Domains</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Areas where trauma survivors commonly report positive growth (Tedeschi & Calhoun)
      </p>
      <ChartContainer config={ptgConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ptgDomainsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" className="text-xs" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Growth" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.5} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">PTSD Rates in Intimate Partner Violence Survivors</h4>
      <p className="text-sm text-muted-foreground mb-4">
        PTSD development rates by type of IPV exposure (VA National Center for PTSD)
      </p>
      <ChartContainer config={ipvConfig} className="h-[280px] w-full">
        <BarChart data={ipvPtsdData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" angle={-15} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">DBT Skills Module Effectiveness</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Patient-reported improvement by DBT skill module (Linehan, 2015)
      </p>
      <ChartContainer config={dbtConfig} className="h-[280px] w-full">
        <BarChart data={dbtSkillsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
};
