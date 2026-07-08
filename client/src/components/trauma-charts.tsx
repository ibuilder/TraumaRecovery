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
    color: "hsl(var(--primary))",
  },
  sleep: {
    label: "Sleep Quality (%)",
    color: "hsl(var(--accent-foreground))",
  },
  nutrition: {
    label: "Nutrition (%)",
    color: "hsl(var(--muted-foreground))",
  },
};

export function PhysicalWellnessChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Physical Wellness Progress Over Time</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Expected improvement in physical health markers during trauma recovery (Research synthesis, 2024)
      </p>
      <ChartContainer config={physicalConfig} className="h-[300px] w-full">
        <LineChart data={physicalWellnessData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="exercise" stroke="var(--color-exercise)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="sleep" stroke="var(--color-sleep)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="nutrition" stroke="var(--color-nutrition)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  anxiety: {
    label: "Anxiety Symptoms (%)",
    color: "hsl(var(--accent-foreground))",
  },
  ptsd: {
    label: "PTSD Symptoms (%)",
    color: "hsl(var(--muted-foreground))",
  },
};

export function ExerciseImpactChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Exercise Frequency and Mental Health Symptoms</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relative symptom levels by exercise frequency (Meta-analysis, Schuch et al., 2024)
      </p>
      <ChartContainer config={exerciseConfig} className="h-[300px] w-full">
        <BarChart data={exerciseImpactData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="depression" fill="var(--color-depression)" radius={4} />
          <Bar dataKey="anxiety" fill="var(--color-anxiety)" radius={4} />
          <Bar dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  recovering: {
    label: "In Recovery",
    color: "hsl(var(--accent-foreground))",
  },
  struggling: {
    label: "Struggling",
    color: "hsl(var(--muted-foreground))",
  },
};

export function FourPillarsChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">The Four Pillars of Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Wellness levels across the four pillars at different stages of recovery
      </p>
      <ChartContainer config={pillarsConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={fourPillarsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pillar" className="text-sm" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Healthy" dataKey="healthy" stroke="var(--color-healthy)" fill="var(--color-healthy)" fillOpacity={0.3} />
          <Radar name="Recovering" dataKey="recovering" stroke="var(--color-recovering)" fill="var(--color-recovering)" fillOpacity={0.3} />
          <Radar name="Struggling" dataKey="struggling" stroke="var(--color-struggling)" fill="var(--color-struggling)" fillOpacity={0.3} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  awareness: {
    label: "Emotional Awareness (%)",
    color: "hsl(var(--accent-foreground))",
  },
  expression: {
    label: "Healthy Expression (%)",
    color: "hsl(var(--muted-foreground))",
  },
};

export function EmotionalRegulationChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Emotional Wellness Development Through Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Growth in emotional skills across recovery stages (Emotion-focused therapy research, 2024)
      </p>
      <ChartContainer config={emotionalConfig} className="h-[300px] w-full">
        <LineChart data={emotionalRegulationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="regulation" stroke="var(--color-regulation)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="awareness" stroke="var(--color-awareness)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="expression" stroke="var(--color-expression)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Mental Wellness Factors in Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Average improvement in mental wellness components after 12 weeks of treatment (CBT outcome studies)
      </p>
      <ChartContainer config={mentalConfig} className="h-[300px] w-full">
        <BarChart data={mentalWellnessData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="factor" width={140} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  wellbeing: {
    label: "Overall Wellbeing (%)",
    color: "hsl(var(--accent-foreground))",
  },
};

export function SocialConnectionChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Social Connection and Recovery Outcomes</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relationship between social support network size and recovery success (Social support meta-analysis, 2024)
      </p>
      <ChartContainer config={socialConfig} className="h-[300px] w-full">
        <BarChart data={socialConnectionData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="connection" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="recovery" fill="var(--color-recovery)" radius={4} />
          <Bar dataKey="wellbeing" fill="var(--color-wellbeing)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  anxietyReduction: {
    label: "Anxiety Reduction (%)",
    color: "hsl(var(--accent-foreground))",
  },
};

export function NutritionImpactChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Key Nutrients and Mental Health Benefits</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Research-supported nutritional interventions for mental health (Nutritional psychiatry review, 2024)
      </p>
      <ChartContainer config={nutritionConfig} className="h-[300px] w-full">
        <BarChart data={nutritionImpactData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nutrient" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="moodImprovement" fill="var(--color-moodImprovement)" radius={4} />
          <Bar dataKey="anxietyReduction" fill="var(--color-anxietyReduction)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
};

export function SleepRecoveryChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Sleep Duration and Trauma Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relationship between sleep hours and PTSD symptoms/recovery (Sleep medicine research, 2024)
      </p>
      <ChartContainer config={sleepConfig} className="h-[300px] w-full">
        <BarChart data={sleepRecoveryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hours" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="ptsdSeverity" fill="var(--color-ptsdSeverity)" radius={4} />
          <Bar dataKey="recoveryRate" fill="var(--color-recoveryRate)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Amygdala Hyperactivity in PTSD</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Amygdala activation levels during trauma reminders vs. baseline and after treatment (Shin & Liberzon, 2024)
      </p>
      <ChartContainer config={amygdalaConfig} className="h-[300px] w-full">
        <BarChart data={amygdalaActivityData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="condition" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="activity" fill="var(--color-activity)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Brain Region Changes in PTSD</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Percentage change in activity/volume compared to non-traumatized controls (van der Kolk, 2024)
      </p>
      <ChartContainer config={brainRegionsConfig} className="h-[300px] w-full">
        <BarChart data={brainRegionsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[-30, 50]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="region" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="change" fill="var(--color-change)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  ptsd: {
    label: "PTSD Levels (%)",
    color: "hsl(var(--destructive))",
  },
};

export function NeurotransmitterLevelsChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Neurotransmitter Levels: Normal vs. PTSD</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Comparison of neurochemical levels (100% = healthy baseline) (Sherin & Nemeroff, 2024)
      </p>
      <ChartContainer config={neurotransmitterConfig} className="h-[300px] w-full">
        <BarChart data={neurotransmitterData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="chemical" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 160]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="normal" fill="var(--color-normal)" radius={4} />
          <Bar dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  ptsd: {
    label: "PTSD Pattern",
    color: "hsl(var(--destructive))",
  },
};

export function CortisolPatternChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Daily Cortisol Patterns</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Normal vs. PTSD cortisol rhythms throughout the day (Yehuda, 2024)
      </p>
      <ChartContainer config={cortisolConfig} className="h-[300px] w-full">
        <LineChart data={cortisolPatternData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Cortisol (mcg/dL)', angle: -90, position: 'insideLeft' }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="normal" stroke="var(--color-normal)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="ptsd" stroke="var(--color-ptsd)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  socialEngagement: {
    label: "Social Engagement",
    color: "hsl(var(--accent-foreground))",
  },
  energyLevel: {
    label: "Energy Level",
    color: "hsl(var(--destructive))",
  },
};

export function PolyvagalStatesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Polyvagal Theory: The Three States</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Characteristics of each autonomic nervous system state (Porges, 2024)
      </p>
      <ChartContainer config={polyvagalConfig} className="h-[300px] w-full">
        <BarChart data={polyvagalStatesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="state" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="safetyLevel" fill="var(--color-safetyLevel)" radius={4} />
          <Bar dataKey="socialEngagement" fill="var(--color-socialEngagement)" radius={4} />
          <Bar dataKey="energyLevel" fill="var(--color-energyLevel)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">PTSD Symptom Clusters</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Prevalence of each symptom cluster in PTSD patients (DSM-5 criteria, APA 2024)
      </p>
      <ChartContainer config={ptsdSymptomsConfig} className="h-[300px] w-full">
        <BarChart data={ptsdSymptomsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
};

export function ComplexPTSDChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Complex PTSD vs. Standard PTSD</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Disturbances in Self-Organization (DSO) symptoms (ICD-11 criteria, Cloitre 2024)
      </p>
      <ChartContainer config={complexPTSDConfig} className="h-[300px] w-full">
        <BarChart data={complexPTSDData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="symptom" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="cptsd" fill="var(--color-cptsd)" radius={4} />
          <Bar dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
};

export function BrainHealingChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Brain Changes with Trauma Treatment</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Neurological measures before and after evidence-based trauma therapy (100% = healthy baseline)
      </p>
      <ChartContainer config={brainHealingConfig} className="h-[300px] w-full">
        <BarChart data={brainHealingData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="measure" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 160]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="before" fill="var(--color-before)" radius={4} />
          <Bar dataKey="after" fill="var(--color-after)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">The ACT Hexaflex: Six Core Processes</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Psychological flexibility develops through strengthening all six interconnected processes (Hayes et al., 2024)
      </p>
      <ChartContainer config={actHexaflexConfig} className="h-[350px] w-full">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={actHexaflexData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="process" className="text-xs" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Process Strength" dataKey="importance" stroke="var(--color-importance)" fill="var(--color-importance)" fillOpacity={0.5} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Common Dysfunctional Family Patterns</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Prevalence of dysfunctional patterns in families with identified dysfunction (Family Systems Research, 2024)
      </p>
      <ChartContainer config={familyDysfunctionConfig} className="h-[300px] w-full">
        <BarChart data={familyDysfunctionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="pattern" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="prevalence" fill="var(--color-prevalence)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Trauma Impact by Developmental Stage</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Earlier trauma during critical periods has greater developmental impact (Perry, 2024)
      </p>
      <ChartContainer config={childhoodTimelineConfig} className="h-[300px] w-full">
        <LineChart data={childhoodTraumaTimelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="impact" stroke="var(--color-impact)" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  concerning: {
    label: "Concerning Signs",
    color: "hsl(var(--accent-foreground))",
  },
  dangerous: {
    label: "Dangerous",
    color: "hsl(var(--destructive))",
  },
};

export function RelationshipSafetyChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Relationship Safety Indicators</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Comparison of safety indicators across relationship health levels (National DV Hotline, 2024)
      </p>
      <ChartContainer config={relationshipSafetyConfig} className="h-[300px] w-full">
        <BarChart data={relationshipSafetyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="indicator" angle={-15} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar dataKey="concerning" fill="var(--color-concerning)" radius={4} />
          <Bar dataKey="dangerous" fill="var(--color-dangerous)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
};

export function WindowToleranceChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">The Window of Tolerance</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Arousal states and optimal functioning zones (Siegel, 2024)
      </p>
      <ChartContainer config={windowToleranceConfig} className="h-[300px] w-full">
        <BarChart data={windowToleranceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="state" width={140} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="intensity" fill="var(--color-intensity)" radius={4} stackId="a" />
          <Bar dataKey="optimal" fill="var(--color-optimal)" radius={4} stackId="a" />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Common Types of Adult Trauma</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Prevalence of different trauma types in adult populations (SAMHSA, 2024)
      </p>
      <ChartContainer config={adultTraumaTypesConfig} className="h-[350px] w-full">
        <BarChart data={adultTraumaTypesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 30]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="type" width={160} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="prevalence" fill="var(--color-prevalence)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Grounding Techniques Effectiveness</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Effectiveness ratings for common grounding techniques (Clinical Psychology Review, 2024)
      </p>
      <ChartContainer config={groundingTechniquesConfig} className="h-[300px] w-full">
        <RadarChart data={groundingTechniquesData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="technique" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Effectiveness"
            dataKey="effectiveness"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  avoidant: {
    label: "Maladaptive (%)",
    color: "hsl(var(--destructive))",
  },
};

export function CopingStrategiesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Coping Strategies: Adaptive vs. Maladaptive</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Comparison of healthy and unhealthy coping mechanisms (APA, 2024)
      </p>
      <ChartContainer config={copingStrategiesConfig} className="h-[300px] w-full">
        <BarChart data={copingStrategiesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar dataKey="avoidant" fill="var(--color-avoidant)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Key Resilience Factors</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Factors that contribute to post-trauma resilience (Resilience Research Centre, 2024)
      </p>
      <ChartContainer config={resilienceFactorsConfig} className="h-[300px] w-full">
        <RadarChart data={resilienceFactorsData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  adoption: {
    label: "Adoption Rate (%)",
    color: "hsl(var(--muted-foreground))",
  },
};

export function SpiritualPracticesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Spiritual Practices in Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Benefits and adoption rates of spiritual practices (Journal of Religion & Health, 2024)
      </p>
      <ChartContainer config={spiritualPracticesConfig} className="h-[300px] w-full">
        <BarChart data={spiritualPracticesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="practice" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="benefit" fill="var(--color-benefit)" radius={4} />
          <Bar dataKey="adoption" fill="var(--color-adoption)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Core Values in Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Values commonly prioritized by those in trauma recovery (ACT Research, 2024)
      </p>
      <ChartContainer config={recoveryValuesConfig} className="h-[300px] w-full">
        <RadarChart data={recoveryValuesData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="value" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Importance"
            dataKey="importance"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  depression: {
    label: "Depression",
    color: "hsl(var(--muted-foreground))",
  },
  anxiety: {
    label: "Anxiety",
    color: "hsl(var(--destructive))",
  },
};

export function TreatmentModalitiesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Treatment Modality Effectiveness</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Effectiveness of trauma treatment approaches by condition (Cochrane Reviews, 2024)
      </p>
      <ChartContainer config={treatmentModalitiesConfig} className="h-[300px] w-full">
        <BarChart data={treatmentModalitiesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="modality" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="ptsd" fill="var(--color-ptsd)" radius={4} />
          <Bar dataKey="depression" fill="var(--color-depression)" radius={4} />
          <Bar dataKey="anxiety" fill="var(--color-anxiety)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Common Cognitive Distortions in Trauma</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Prevalence of thinking errors among trauma survivors (CBT Research, 2024)
      </p>
      <ChartContainer config={cognitiveDistortionsConfig} className="h-[350px] w-full">
        <BarChart data={cognitiveDistortionsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="distortion" width={130} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="frequency" fill="var(--color-frequency)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  regulation: {
    label: "Emotional Regulation",
    color: "hsl(var(--muted-foreground))",
  },
};

export function MindfulnessBenefitsChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Mindfulness Practice Benefits Over Time</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Improvements from regular mindfulness practice (MBSR Research, 2024)
      </p>
      <ChartContainer config={mindfulnessBenefitsConfig} className="h-[300px] w-full">
        <LineChart data={mindfulnessBenefitsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="stress" stroke="var(--color-stress)" strokeWidth={2} />
          <Line type="monotone" dataKey="focus" stroke="var(--color-focus)" strokeWidth={2} />
          <Line type="monotone" dataKey="regulation" stroke="var(--color-regulation)" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Somatic Therapy Techniques</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Effectiveness of body-based trauma interventions (Somatic Experiencing Intl., 2024)
      </p>
      <ChartContainer config={somaticTherapyConfig} className="h-[300px] w-full">
        <RadarChart data={somaticTherapyData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="technique" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Effectiveness"
            dataKey="effectiveness"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  importance: {
    label: "Clinical Importance",
    color: "hsl(var(--muted-foreground))",
  },
};

export function EMDRPhasesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">EMDR Treatment Phases</h4>
      <p className="text-sm text-muted-foreground mb-4">
        The 8-phase EMDR protocol (EMDRIA, 2024)
      </p>
      <ChartContainer config={emdrPhasesConfig} className="h-[350px] w-full">
        <BarChart data={emdrPhasesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="phase" width={120} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="time" fill="var(--color-time)" radius={4} />
          <Bar dataKey="importance" fill="var(--color-importance)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  porous: {
    label: "Porous (%)",
    color: "hsl(var(--muted-foreground))",
  },
  rigid: {
    label: "Rigid (%)",
    color: "hsl(var(--destructive))",
  },
};

export function BoundaryTypesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Types of Boundaries</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Distribution of boundary styles across different areas (Family Therapy Research, 2024)
      </p>
      <ChartContainer config={boundaryTypesConfig} className="h-[300px] w-full">
        <BarChart data={boundaryTypesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="healthy" fill="var(--color-healthy)" radius={4} />
          <Bar dataKey="porous" fill="var(--color-porous)" radius={4} />
          <Bar dataKey="rigid" fill="var(--color-rigid)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  safety: {
    label: "Felt Safety",
    color: "hsl(var(--muted-foreground))",
  },
  expression: {
    label: "Emotional Expression",
    color: "hsl(var(--destructive))",
  },
};

export function InnerChildHealingChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Inner Child Healing Progress</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Typical healing trajectory in inner child work (IFS Institute, 2024)
      </p>
      <ChartContainer config={innerChildHealingConfig} className="h-[300px] w-full">
        <LineChart data={innerChildHealingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="awareness" stroke="var(--color-awareness)" strokeWidth={2} />
          <Line type="monotone" dataKey="safety" stroke="var(--color-safety)" strokeWidth={2} />
          <Line type="monotone" dataKey="expression" stroke="var(--color-expression)" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">DBT Distress Tolerance Skills</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Effectiveness ratings for crisis survival skills (Linehan Institute, 2024)
      </p>
      <ChartContainer config={distressToleranceConfig} className="h-[300px] w-full">
        <BarChart data={distressToleranceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    color: "hsl(var(--primary))",
  },
  relationship: {
    label: "Relationship Effectiveness",
    color: "hsl(var(--muted-foreground))",
  },
  selfrespect: {
    label: "Self-Respect Effectiveness",
    color: "hsl(var(--destructive))",
  },
};

export function InterpersonalEffectivenessChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">DBT Interpersonal Effectiveness Skills</h4>
      <p className="text-sm text-muted-foreground mb-4">
        When to use each skill set (DBT Skills Training Manual, Linehan, 2024)
      </p>
      <ChartContainer config={interpersonalEffectivenessConfig} className="h-[300px] w-full">
        <BarChart data={interpersonalEffectivenessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="skill" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="objective" fill="var(--color-objective)" radius={4} />
          <Bar dataKey="relationship" fill="var(--color-relationship)" radius={4} />
          <Bar dataKey="selfrespect" fill="var(--color-selfrespect)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Sex Addiction Prevalence by Population</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Estimated prevalence of compulsive sexual behavior disorder across populations (Kraus et al., 2016; WHO, 2019)
      </p>
      <ChartContainer config={sexAddictionPrevalenceConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionPrevalenceData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 35]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="group" width={160} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="rate" fill="var(--color-rate)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Brain Region Activity: Sex Addiction vs. Healthy Controls</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relative activation levels in key brain regions during sexual cue exposure (Kühn & Gallinat, 2014)
      </p>
      <ChartContainer config={sexAddictionBrainConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionBrainData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="region" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="addiction" fill="var(--color-addiction)" radius={4} />
          <Bar dataKey="healthy" fill="var(--color-healthy)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Childhood Trauma in Sex Addiction</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Percentage of sex addicts reporting specific childhood trauma types (Carnes, 2001)
      </p>
      <ChartContainer config={sexAddictionTraumaConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionTraumaData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="trauma" width={150} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Carnes' Four-Phase Addiction Cycle</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relative neurochemical intensity and duration of each phase (Carnes, 1983)
      </p>
      <ChartContainer config={carnesCycleConfig} className="h-[300px] w-full">
        <BarChart data={carnesCycleData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="phase" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="intensity" fill="var(--color-intensity)" radius={4} />
          <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Core Belief System in Sex Addiction</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Percentage of sex addicts endorsing core distorted beliefs (Carnes, 2001)
      </p>
      <ChartContainer config={sexAddictionBeliefsConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionBeliefsData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="belief" width={175} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

const threeCirclesData = [
  { name: "Inner Circle (Addictive)", value: 20, fill: "hsl(var(--destructive))" },
  { name: "Middle Circle (Caution)", value: 35, fill: "hsl(var(--chart-4))" },
  { name: "Outer Circle (Healthy)", value: 45, fill: "hsl(var(--chart-2))" },
];

export function ThreeCirclesChart() {
  return (
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Three Circles Model of Sexual Recovery</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Framework for defining personal sexual sobriety (SAA / Carnes model)
      </p>
      <ChartContainer config={{}} className="h-[300px] w-full">
        <PieChart>
          <Pie data={threeCirclesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
            {threeCirclesData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Love Addiction vs. Love Avoidance Patterns</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Comparison of behavioral patterns in love addiction and love avoidance (Mellody, 2003)
      </p>
      <ChartContainer config={loveAddictionPatternsConfig} className="h-[320px] w-full">
        <BarChart data={loveAddictionPatternsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="pattern" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="loveAddict" fill="var(--color-loveAddict)" radius={4} />
          <Bar dataKey="loveAvoidant" fill="var(--color-loveAvoidant)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Trauma Bonding Cycle</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Intermittent reinforcement patterns that create powerful trauma bonds (Dutton & Hart, 1994)
      </p>
      <ChartContainer config={traumaBondingConfig} className="h-[300px] w-full">
        <LineChart data={traumaBondingData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="phase" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="intensity" stroke="var(--color-intensity)" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Meadows Treatment Components & Effectiveness</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Patient-reported benefit ratings for key Meadows treatment modalities (The Meadows, 2024)
      </p>
      <ChartContainer config={meadowsTreatmentConfig} className="h-[300px] w-full">
        <BarChart data={meadowsTreatmentData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="component" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="effectiveness" fill="var(--color-effectiveness)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Recovery Outcomes Over Time</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Trajectory of sobriety maintenance, well-being, and relationship quality during recovery (Carnes et al., 2005)
      </p>
      <ChartContainer config={meadowsOutcomeConfig} className="h-[300px] w-full">
        <LineChart data={meadowsOutcomeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="timepoint" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="sobriety" stroke="var(--color-sobriety)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="wellbeing" stroke="var(--color-wellbeing)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="relationships" stroke="var(--color-relationships)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Recovery Progress Through the Three Circles</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Shift in behavioral patterns across recovery stages (SAA / Carnes model)
      </p>
      <ChartContainer config={sexAddictionRecoveryProgressConfig} className="h-[300px] w-full">
        <BarChart data={sexAddictionRecoveryProgressData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="stage" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="innerCircle" fill="var(--color-innerCircle)" radius={4} />
          <Bar dataKey="middleCircle" fill="var(--color-middleCircle)" radius={4} />
          <Bar dataKey="outerCircle" fill="var(--color-outerCircle)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Sex Addiction Recovery Milestones</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Key recovery milestones and typical completion rates in sex addiction treatment (Carnes, 2010)
      </p>
      <ChartContainer config={sexAddictionRecoveryRoadmapConfig} className="h-[320px] w-full">
        <BarChart data={sexAddictionRecoveryRoadmapData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="milestone" width={165} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="completion" fill="var(--color-completion)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
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
    <div className="my-8 p-6 bg-card rounded-md border">
      <h4 className="text-lg font-semibold mb-2">Treatment Options: Accessibility & Availability</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Relative accessibility and national availability of sex addiction treatment options (IITAP, 2024)
      </p>
      <ChartContainer config={treatmentAccessConfig} className="h-[300px] w-full">
        <BarChart data={treatmentAccessData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="accessibility" fill="var(--color-accessibility)" radius={4} />
          <Bar dataKey="availability" fill="var(--color-availability)" radius={4} />
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
