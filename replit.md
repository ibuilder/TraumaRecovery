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
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── chapters/             # Book content organized by chapter
│   │   │   ├── index.ts          # Chapter exports
│   │   │   ├── types.ts          # Chapter type definitions
│   │   │   ├── basicRecovery.ts  # Chapter 1
│   │   │   ├── addictionRecovery.ts # Chapter 2 (5 subchapters)
│   │   │   ├── dysfunctionalFamilies.ts # Chapter 3
│   │   │   ├── childhoodTrauma.ts # Chapter 4
│   │   │   ├── adultTrauma.ts    # Chapter 5
│   │   │   ├── relationshipTrauma.ts # Chapter 6
│   │   │   ├── cbt.ts            # Chapter 7
│   │   │   ├── dbt.ts            # Chapter 8
│   │   │   ├── act.ts            # Chapter 9
│   │   │   ├── spirituality.ts   # Chapter 10 (4 subchapters)
│   │   │   └── alternativeTherapies.ts # Chapter 11 (3 subchapters)
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
- **11 comprehensive chapters** covering trauma recovery topics
- **Markdown rendering** with react-markdown and remark-gfm
- **Dark/light theme** with system preference detection
- **Reading progress bar** for tracking position
- **Responsive sidebar** navigation on desktop
- **Mobile-friendly** with hamburger menu
- **Back-to-top button** for long content
- **Crisis resources** in footer

## Book Chapters
1. Basic Recovery
2. Addiction Recovery (5 subchapters: Disease of Addiction, Brain Chemistry, Substance Use Disorder, Recovery Programs, Relapse Prevention)
3. Dysfunctional Families
4. Childhood Trauma
5. Adult Trauma
6. Relationship Trauma
7. CBT (Cognitive Behavioral Therapy)
8. DBT (Dialectical Behavior Therapy)
9. ACT (Acceptance and Commitment Therapy)
10. Spirituality (4 subchapters: Serenity Prayer, Recovery Prayers, Finding Meaning, Spiritual Practices)
11. Alternative Therapies (3 subchapters: Somatic Therapy, EMDR, TMS)

## Tech Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- wouter for routing
- react-markdown for content rendering
- Vite for development

## Running the Project
The application runs on port 5000 with `npm run dev`.

## Design Philosophy
- Calm, professional aesthetic suitable for mental health content
- High contrast and accessibility compliance
- Content-forward design with minimal distractions
- Generous spacing for readability
- Subtle animations that don't overwhelm
