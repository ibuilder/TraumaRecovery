# Healing Together - Trauma Recovery Book Website

A comprehensive web application presenting a trauma recovery book with 12 markdown-based chapters, interactive data visualizations, and curated video resources from leading trauma experts.

## Features

- **12 Comprehensive Chapters** covering trauma recovery topics from basic recovery to specialized therapies
- **18 Interactive Data Visualizations** using Recharts for statistics and recovery metrics
- **Video Resource Library** featuring Dr. Gabor Maté, Dr. Bessel van der Kolk, Meadows Senior Fellows, and treatment centers
- **Dark/Light Theme** with system preference detection
- **Reading Progress Bar** for tracking position in chapters
- **Responsive Design** with mobile-friendly navigation
- **Accessible Design** optimized for sensitive mental health content

## Book Chapters

1. **Basic Recovery** - Four Pillars Framework (Physical, Emotional, Mental, Social Wellness)
2. **Addiction Recovery** - Disease Model, Brain Chemistry, SUDs, Recovery Programs, Relapse Prevention
3. **Dysfunctional Families** - Family systems, roles, and healing
4. **Childhood Trauma** - ACEs, developmental impact, and recovery
5. **Adult Trauma** - PTSD, processing, and post-traumatic growth
6. **Relationship Trauma** - Attachment, boundaries, and healthy relationships
7. **CBT** - Cognitive Behavioral Therapy techniques
8. **DBT** - Dialectical Behavior Therapy (Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness)
9. **ACT** - Acceptance and Commitment Therapy
10. **Spirituality** - Higher Powers, Serenity Prayer, Recovery Prayers, Spiritual Practices
11. **Alternative Therapies** - Somatic Therapy, EMDR, TMS
12. **Resources & Video Library** - Expert videos, treatment centers, apps, and crisis resources

## Featured Experts

- **Dr. Gabor Maté** - Trauma, addiction, and compassionate inquiry
- **Dr. Bessel van der Kolk** - The Body Keeps the Score, trauma neuroscience
- **Dr. Kevin McCauley** - Pleasure Unwoven documentary, addiction neuroscience
- **Pia Mellody** - Codependency, developmental trauma
- **Dr. Claudia Black** - Adult children of alcoholics, family systems
- **Dr. Peter Levine** - Somatic Experiencing
- **Dr. Tian Dayton** - Psychodrama
- **Patrick Carnes** - Sexual addiction recovery

## Treatment Centers Featured

- The Refuge: A Healing Place
- Sierra Tucson
- The Meadows
- Hazelden Betty Ford
- Caron Treatment Centers

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Components**: shadcn/ui
- **Routing**: wouter
- **Content**: react-markdown with remark-gfm
- **Charts**: Recharts
- **Backend**: Express.js
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
client/
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── trauma-charts.tsx  # 18 data visualization charts
│   │   └── markdown-renderer.tsx
│   ├── lib/
│   │   └── chapters/     # Book content (12 chapters)
│   └── pages/            # Route pages
server/
├── index.ts              # Express server
└── routes.ts             # API routes
shared/
└── schema.ts             # Shared types
```

## Crisis Resources

If you or someone you know is in crisis:

- **988 Suicide & Crisis Lifeline**: Call or text 988 (24/7)
- **Crisis Text Line**: Text HOME to 741741 (24/7)
- **SAMHSA National Helpline**: 1-800-662-4357 (24/7)
- **Veterans Crisis Line**: 988, then press 1 (24/7)

## License

This project is for educational purposes. Content is based on evidence-based trauma treatment approaches and includes citations to original research (2024-2025).

## Acknowledgments

Special thanks to the trauma recovery community and the experts whose work forms the foundation of this resource. This project aims to make trauma education accessible while encouraging professional treatment.
