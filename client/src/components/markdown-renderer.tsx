import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
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
  ACTHexaflexChart,
  FamilyDysfunctionChart,
  ChildhoodTraumaTimelineChart,
  RelationshipSafetyChart,
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
  AddictionHeritabilityChart,
  DopamineRateChart,
  AlcoholGabaGlutamateChart,
  RelationshipTypesChart,
  SobrietyChallengesChart,
  CarnesRecoveryStagesChart,
  WorryWindowChart,
  FunctionalAdultCurveChart,
  DramaTriangleChart,
  ACATreeChart,
  CoreSymptomsChart,
  FourHorsemenChart,
  BoundaryLadderChart,
  AttachmentMapChart,
  CatastrophizingIcebergChart,
  CoreBeliefCycleChart,
  AskIntensityChart,
  MiddlePathChart,
  BullseyeChart,
  FearDareChart,
  AddictiveSystemChart,
  ThreeCirclesGuideChart,
  RelapsePrecipitantsChart,
  StagesOfChangeChart,
  ThreeStagesOfRelapseChart,
  UrgeEscalationChart,
  SmartFourPointChart,
  MutualAidComparisonChart,
  EightPrinciplesChart,
  DailyPracticeChart,
  AmendsKindsChart,
} from "@/components/trauma-charts";

interface MarkdownRendererProps {
  content: string;
  showCharts?: boolean;
}

const chartComponents: Record<string, React.ComponentType> = {
  "PTSDPrevalenceChart": PTSDPrevalenceChart,
  "ACEsPrevalenceChart": ACEsPrevalenceChart,
  "RecoveryTimelineChart": RecoveryTimelineChart,
  "TraumaAddictionChart": TraumaAddictionChart,
  "TherapyEffectivenessChart": TherapyEffectivenessChart,
  "AttachmentStylesChart": AttachmentStylesChart,
  "ACEsHealthRiskChart": ACEsHealthRiskChart,
  "PostTraumaticGrowthChart": PostTraumaticGrowthChart,
  "IPVPTSDChart": IPVPTSDChart,
  "DBTSkillsChart": DBTSkillsChart,
  "PhysicalWellnessChart": PhysicalWellnessChart,
  "ExerciseImpactChart": ExerciseImpactChart,
  "FourPillarsChart": FourPillarsChart,
  "EmotionalRegulationChart": EmotionalRegulationChart,
  "MentalWellnessChart": MentalWellnessChart,
  "SocialConnectionChart": SocialConnectionChart,
  "NutritionImpactChart": NutritionImpactChart,
  "SleepRecoveryChart": SleepRecoveryChart,
  "AmygdalaActivityChart": AmygdalaActivityChart,
  "BrainRegionsTraumaChart": BrainRegionsTraumaChart,
  "NeurotransmitterLevelsChart": NeurotransmitterLevelsChart,
  "CortisolPatternChart": CortisolPatternChart,
  "PolyvagalStatesChart": PolyvagalStatesChart,
  "PTSDSymptomsChart": PTSDSymptomsChart,
  "ComplexPTSDChart": ComplexPTSDChart,
  "BrainHealingChart": BrainHealingChart,
  "WindowToleranceChart": WindowToleranceChart,
  "ACTHexaflexChart": ACTHexaflexChart,
  "FamilyDysfunctionChart": FamilyDysfunctionChart,
  "ChildhoodTraumaTimelineChart": ChildhoodTraumaTimelineChart,
  "RelationshipSafetyChart": RelationshipSafetyChart,
  "AdultTraumaTypesChart": AdultTraumaTypesChart,
  "GroundingTechniquesChart": GroundingTechniquesChart,
  "CopingStrategiesChart": CopingStrategiesChart,
  "ResilienceFactorsChart": ResilienceFactorsChart,
  "SpiritualPracticesChart": SpiritualPracticesChart,
  "RecoveryValuesChart": RecoveryValuesChart,
  "TreatmentModalitiesChart": TreatmentModalitiesChart,
  "CognitiveDistortionsChart": CognitiveDistortionsChart,
  "MindfulnessBenefitsChart": MindfulnessBenefitsChart,
  "SomaticTherapyChart": SomaticTherapyChart,
  "EMDRPhasesChart": EMDRPhasesChart,
  "BoundaryTypesChart": BoundaryTypesChart,
  "InnerChildHealingChart": InnerChildHealingChart,
  "DistressToleranceSkillsChart": DistressToleranceSkillsChart,
  "InterpersonalEffectivenessChart": InterpersonalEffectivenessChart,
  "SexAddictionPrevalenceChart": SexAddictionPrevalenceChart,
  "SexAddictionBrainChart": SexAddictionBrainChart,
  "SexAddictionTraumaChart": SexAddictionTraumaChart,
  "CarnesAddictionCycleChart": CarnesAddictionCycleChart,
  "SexAddictionBeliefsChart": SexAddictionBeliefsChart,
  "ThreeCirclesChart": ThreeCirclesChart,
  "LoveAddictionPatternsChart": LoveAddictionPatternsChart,
  "TraumaBondingCycleChart": TraumaBondingCycleChart,
  "MeadowsTreatmentModelChart": MeadowsTreatmentModelChart,
  "MeadowsOutcomeChart": MeadowsOutcomeChart,
  "SexAddictionRecoveryProgressChart": SexAddictionRecoveryProgressChart,
  "SexAddictionRecoveryRoadmapChart": SexAddictionRecoveryRoadmapChart,
  "TreatmentAccessChart": TreatmentAccessChart,
  "AddictionHeritabilityChart": AddictionHeritabilityChart,
  "DopamineRateChart": DopamineRateChart,
  "AlcoholGabaGlutamateChart": AlcoholGabaGlutamateChart,
  "RelationshipTypesChart": RelationshipTypesChart,
  "SobrietyChallengesChart": SobrietyChallengesChart,
  "CarnesRecoveryStagesChart": CarnesRecoveryStagesChart,
  "WorryWindowChart": WorryWindowChart,
  "FunctionalAdultCurveChart": FunctionalAdultCurveChart,
  "DramaTriangleChart": DramaTriangleChart,
  "ACATreeChart": ACATreeChart,
  "CoreSymptomsChart": CoreSymptomsChart,
  "FourHorsemenChart": FourHorsemenChart,
  "BoundaryLadderChart": BoundaryLadderChart,
  "AttachmentMapChart": AttachmentMapChart,
  "CatastrophizingIcebergChart": CatastrophizingIcebergChart,
  "CoreBeliefCycleChart": CoreBeliefCycleChart,
  "AskIntensityChart": AskIntensityChart,
  "MiddlePathChart": MiddlePathChart,
  "BullseyeChart": BullseyeChart,
  "FearDareChart": FearDareChart,
  "AddictiveSystemChart": AddictiveSystemChart,
  "ThreeCirclesGuideChart": ThreeCirclesGuideChart,
  "RelapsePrecipitantsChart": RelapsePrecipitantsChart,
  "StagesOfChangeChart": StagesOfChangeChart,
  "ThreeStagesOfRelapseChart": ThreeStagesOfRelapseChart,
  "UrgeEscalationChart": UrgeEscalationChart,
  "SmartFourPointChart": SmartFourPointChart,
  "MutualAidComparisonChart": MutualAidComparisonChart,
  "EightPrinciplesChart": EightPrinciplesChart,
  "DailyPracticeChart": DailyPracticeChart,
  "AmendsKindsChart": AmendsKindsChart,
};

/**
 * Chart placeholders are authored as a single-line ```chart:Name``` span, which
 * CommonMark parses as an inline code span. Fenced `\`\`\`chart:Name` blocks are also
 * supported; those arrive wrapped in a <pre>, so `pre` is unwrapped below to keep
 * the chart out of the prose code-block styling.
 */
const CHART_INLINE_RE = /^chart:(\w+)$/;
const CHART_FENCE_RE = /language-chart:(\w+)/;

function isChartElement(node: unknown): boolean {
  return (
    !!node &&
    typeof node === "object" &&
    "props" in (node as any) &&
    CHART_FENCE_RE.test(String((node as any).props?.className ?? ""))
  );
}

/**
 * Anchor slug for a heading. Kept in step with `slugifyHeading` in
 * script/generate-search-index.ts — search results deep-link to these ids, so
 * the two have to agree character for character.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** The visible text of a heading, so it can be turned into an anchor. */
function headingText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingText).join("");
  if (typeof node === "object" && "props" in (node as any)) {
    return headingText((node as any).props?.children);
  }
  return "";
}

export function MarkdownRenderer({ content, showCharts = true }: MarkdownRendererProps) {
  // Two sections in a chapter can both be called "What it is". The counter is
  // recreated on every render and react-markdown walks the document in order,
  // so repeats get -2, -3 and stay stable between renders.
  const seen = new Map<string, number>();
  const anchor = (children: ReactNode) => {
    const base = slugifyHeading(headingText(children));
    if (!base) return undefined;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children }) => {
            const fencedMatch = CHART_FENCE_RE.exec(className || "");
            const inlineMatch = CHART_INLINE_RE.exec(String(children).trim());
            const chartName = fencedMatch?.[1] ?? inlineMatch?.[1];

            if (chartName && showCharts) {
              const ChartComponent = chartComponents[chartName];
              if (ChartComponent) {
                // Tagged with the component name so tooling can map a rendered
                // figure back to the placeholder that asked for it. Guessing
                // the mapping from the figure's visible title silently lost
                // sixty of the hundred placements in the EPUB build.
                return (
                  <div data-chart={chartName} className="contents">
                    <ChartComponent />
                  </div>
                );
              }
              if (import.meta.env.DEV) {
                console.warn(`Unknown chart referenced in content: "${chartName}"`);
              }
              return null;
            }

            return <code className={className}>{children}</code>;
          },
          th: ({ children, ...props }) => {
            // A comparison table's corner cell heads nothing, and an empty
            // `<th>` claims to. HTML's answer is a `<td>`; markdown has no way
            // to say it, so it is said here. Five tables in the book have one.
            const empty = children == null || (Array.isArray(children) && children.length === 0);
            return empty ? <td /> : <th {...props}>{children}</th>;
          },
          pre: ({ children }) => {
            // A fenced chart block renders a full-width figure, not a code block.
            const kids = Array.isArray(children) ? children : [children];
            if (showCharts && kids.some(isChartElement)) {
              return <>{children}</>;
            }
            // `text-foreground` is load-bearing: the typography plugin styles
            // `pre` for a dark block and sets the code colour to gray-200,
            // which against `bg-muted` measured a contrast ratio of 1.01 — the
            // book's one ASCII diagram was invisible in light mode, not merely
            // hard to read.
            return (
              <pre className="mb-6 overflow-x-auto rounded-md bg-muted p-4 text-sm text-foreground">
                {children}
              </pre>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-bold mt-0 mb-6 text-foreground" data-testid="text-chapter-title">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={anchor(children)}
              className="text-2xl md:text-3xl font-semibold mt-12 mb-4 text-foreground border-b pb-2 scroll-mt-20"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={anchor(children)}
              className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground scroll-mt-20"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg md:text-xl font-medium mt-6 mb-2 text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => {
            const childArr = Array.isArray(children) ? children : [children];
            const hasBlock = childArr.some(
              (child) =>
                child &&
                typeof child === "object" &&
                "type" in (child as any) &&
                typeof (child as any).type !== "string"
            );
            if (hasBlock) {
              return <div className="mb-6">{children}</div>;
            }
            return <p className="mb-6 leading-relaxed text-foreground/90">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="mb-6 ml-6 space-y-2 list-disc marker:text-primary/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 ml-6 space-y-2 list-decimal marker:text-primary/60">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-foreground/90">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-6 my-8 italic text-muted-foreground bg-muted/30 py-4 pr-4 rounded-r-md">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-8 border-border" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
