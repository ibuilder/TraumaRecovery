# Healing Together - Trauma Recovery Book Website

## Overview
A comprehensive web application for presenting a trauma recovery book with markdown-based chapters. Built with React, TypeScript, and Tailwind CSS, featuring a clean, accessible reading experience optimized for sensitive mental health content.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── back-to-top.tsx      # Scroll-to-top button
│   │   ├── chapter-card.tsx      # Chapter navigation cards
│   │   ├── chapter-sidebar.tsx   # Sidebar navigation for chapters
│   │   ├── footer.tsx            # Site footer with resources
│   │   ├── header.tsx            # Site header with navigation
│   │   ├── markdown-renderer.tsx # Markdown content renderer
│   │   ├── reading-progress.tsx  # Reading progress bar
│   │   ├── theme-provider.tsx    # Dark/light theme context
│   │   ├── theme-toggle.tsx      # Theme toggle button
│   │   ├── trauma-charts.tsx     # Data visualization components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── chapters/             # Book content organized by chapter
│   │   │   ├── index.ts          # Chapter exports
│   │   │   ├── types.ts          # Chapter type definitions
│   │   │   ├── basicRecovery.ts  # Chapter 1 (6 subchapters)
│   │   │   ├── addictionRecovery.ts # Chapter 2 (5 subchapters)
│   │   │   ├── dysfunctionalFamilies.ts # Chapter 3
│   │   │   ├── childhoodTrauma.ts # Chapter 4
│   │   │   ├── adultTrauma.ts    # Chapter 5
│   │   │   ├── relationshipTrauma.ts # Chapter 6
│   │   │   ├── cbt.ts            # Chapter 7
│   │   │   ├── dbt.ts            # Chapter 8 (6 subchapters)
│   │   │   ├── act.ts            # Chapter 9
│   │   │   ├── spirituality.ts   # Chapter 10 (4 subchapters)
│   │   │   ├── alternativeTherapies.ts # Chapter 11 (3 subchapters)
│   │   │   ├── resources.ts      # Chapter 12 (2 subchapters)
│   │   │   └── neuroscience.ts   # Chapter 13 (5 subchapters)
│   │   ├── queryClient.ts        # React Query setup
│   │   └── utils.ts              # Utility functions
│   ├── pages/
│   │   ├── chapter.tsx           # Chapter reading view
│   │   ├── chapters.tsx          # All chapters listing
│   │   ├── home.tsx              # Homepage with hero
│   │   └── not-found.tsx         # 404 page
│   └── App.tsx                   # Main app component
├── index.html                    # HTML entry point
└── index.css                     # Global styles

server/
├── routes.ts                     # API routes
├── storage.ts                    # Storage interface
└── index.ts                      # Server entry

shared/
└── schema.ts                     # Shared types/schemas
```

## Key Features
- **13 comprehensive chapters** covering trauma recovery topics
- **46 data visualization charts** using Recharts covering all chapters and subchapters
- **Markdown rendering** with react-markdown and remark-gfm
- **Dark/light theme** with system preference detection
- **Reading progress bar** for tracking position
- **Responsive sidebar** navigation on desktop
- **Mobile-friendly** with hamburger menu
- **Back-to-top button** for long content
- **Crisis resources** in footer

## Book Chapters
1. Basic Recovery (8 subchapters: Four Pillars Framework, Addiction & Self-Harm, Understanding Different Types of Trauma)
2. Neuroscience of Trauma (5 subchapters: Brain Anatomy, Neurochemistry, Nervous System & Polyvagal Theory, Trauma-Related Disorders, Neurobiology of Healing)
3. Addiction Recovery (6 subchapters: Disease Model, Brain Chemistry, SUD, Recovery Programs, Relapse Prevention, Urge Surfing)
4. Dysfunctional Families (4 subchapters: Family Patterns, Healthy Boundaries, Inner Child Work, Breaking Generational Cycles)
5. Childhood Trauma (4 subchapters: Inner Child Work, Breaking From Shame, Attachment Healing, Developmental Impact of Trauma)
6. Adult Trauma (3 subchapters: Processing Trauma, Rebuilding Life, Coping Strategies)
7. Relationship Trauma (4 subchapters: Toxic Patterns, Rebuilding Trust, Safety Planning, Building Healthy Relationships)
8. CBT (4 subchapters: CBT Core, The CBT Triangle, Cognitive Distortions, Competent Protectors/IFS)
9. DBT (6 subchapters: Mindfulness, Wise Mind, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness, DBT Acronyms Guide)
10. ACT (4 subchapters: Values Clarification, Defusion Techniques, The ACT Hexaflex, Acceptance in Practice)
11. Alternative Therapies (3 subchapters: Somatic Therapy, EMDR, TMS)
12. Spirituality (4 subchapters: Higher Powers, Serenity Prayer, Recovery Prayers, Spiritual Practices)
13. Resources & Video Library (2 subchapters: Expert Videos, Treatment Centers)

## YouTube Video Library Features
- Dr. Gabor Maté videos and podcast appearances
- Dr. Bessel van der Kolk lectures and resources
- Triangle Wellness / Dr. Sara Koenig information
- The Refuge trauma treatment center
- Sierra Tucson treatment programs
- Additional recommended channels (Patrick Teahan, Crappy Childhood Fairy, Therapy in a Nutshell)
- Online courses and apps for recovery
- Crisis resources

## Tech Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- wouter for routing
- react-markdown for content rendering
- Recharts for data visualizations
- Vite for development

## Running the Project
The application runs on port 5000 with `npm run dev`.

## Design Philosophy
- Calm, professional aesthetic suitable for mental health content
- High contrast and accessibility compliance
- Content-forward design with minimal distractions
- Generous spacing for readability
- Subtle animations that don't overwhelm
