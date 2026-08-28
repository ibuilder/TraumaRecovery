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

export function MarkdownRenderer({ content, showCharts = true }: MarkdownRendererProps) {
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
                return <ChartComponent />;
              }
              if (import.meta.env.DEV) {
                console.warn(`Unknown chart referenced in content: "${chartName}"`);
              }
              return null;
            }

            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => {
            // A fenced chart block renders a full-width figure, not a code block.
            const kids = Array.isArray(children) ? children : [children];
            if (showCharts && kids.some(isChartElement)) {
              return <>{children}</>;
            }
            return (
              <pre className="mb-6 overflow-x-auto rounded-md bg-muted p-4 text-sm">
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
            <h2 className="text-2xl md:text-3xl font-semibold mt-12 mb-4 text-foreground border-b pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground">
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
