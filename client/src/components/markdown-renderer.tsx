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
} from "@/components/trauma-charts";

interface MarkdownRendererProps {
  content: string;
  showCharts?: boolean;
  chapterSlug?: string;
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
};

export function MarkdownRenderer({ content, showCharts = true }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children }) => {
            // Check for fenced code block with language identifier
            const fencedMatch = /language-chart:(\w+)/.exec(className || "");
            if (fencedMatch && showCharts) {
              const ChartComponent = chartComponents[fencedMatch[1]];
              if (ChartComponent) {
                return <ChartComponent />;
              }
            }
            
            // Check for inline code with chart syntax (e.g., ```chart:ChartName```)
            const childText = String(children).trim();
            const inlineMatch = /^chart:(\w+)$/.exec(childText);
            if (inlineMatch && showCharts) {
              const ChartComponent = chartComponents[inlineMatch[1]];
              if (ChartComponent) {
                return <ChartComponent />;
              }
            }
            
            return <code className={className}>{children}</code>;
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
          p: ({ children }) => (
            <p className="mb-6 leading-relaxed text-foreground/90">
              {children}
            </p>
          ),
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
