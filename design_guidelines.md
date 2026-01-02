# Design Guidelines: Trauma Recovery Book Website

## Design Approach
**Reference-Based: Healthcare/Educational Content Sites** - Drawing inspiration from Calm, Headspace, BetterHelp, and Psychology Today. Focus on creating a safe, trustworthy, and readable experience appropriate for sensitive mental health content.

## Core Design Principles
1. **Calm & Professional**: Avoid aggressive design elements; prioritize readability and trust
2. **Clear Hierarchy**: Easy navigation through complex chapter structure
3. **Accessibility First**: High contrast, readable text, clear focus states for trauma-sensitive audience
4. **Content-Forward**: Design serves the educational content, never distracts from it

## Typography System
- **Primary Font**: Inter or Source Sans Pro (Google Fonts) - clean, highly readable
- **Heading Font**: Same as primary for consistency and readability
- **Sizes**: 
  - H1: text-4xl md:text-5xl (page titles)
  - H2: text-3xl md:text-4xl (chapter titles)
  - H3: text-2xl md:text-3xl (subchapters)
  - H4: text-xl md:text-2xl (sections)
  - Body: text-lg leading-relaxed (optimal for long-form reading)
  - Small: text-base (navigation, metadata)

## Layout System
**Spacing Units**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-16 md:py-24
- Component spacing: gap-8 or gap-12
- Content margins: mb-6, mb-8 for paragraphs and sections

**Container Strategy**:
- Main content: max-w-3xl (optimal reading width ~65-75 characters)
- Full-width sections: max-w-7xl
- Sidebar layouts: 2:1 ratio (content to sidebar)

## Page Structure

### Header
- Sticky navigation with book title and author
- Hamburger menu for mobile chapter navigation
- Search icon (for future chapter search)
- Progress indicator showing reading position

### Hero Section (NOT full-viewport)
- 60vh height maximum
- Calming hero image: soft-focus nature scene, sunrise, peaceful setting
- Centered content with book title, subtitle, and gentle CTA ("Begin Reading" or "Start Your Journey")
- Subtle gradient overlay for text readability (no harsh backgrounds)

### Chapter Navigation Section
- Card-based grid: 2 columns on tablet, 3 columns on desktop
- Each card includes:
  - Chapter number
  - Chapter title
  - Brief 1-2 sentence description
  - Icon representing the topic (Heroicons)
  - Estimated reading time
  - Subtle hover state (slight elevation, no dramatic effects)

### Content Reading View
- Single-column layout, max-w-3xl centered
- Sticky sidebar on desktop (lg:) with:
  - Table of contents for current chapter
  - Progress through chapter
  - Quick navigation to related chapters
- Markdown styling with generous spacing:
  - Paragraphs: mb-6
  - Headings: mt-12 mb-4
  - Lists: ml-6 space-y-3
  - Blockquotes: border-l-4 pl-6 italic

### Footer
- Resources section: Crisis hotlines, additional help resources
- Chapter index
- Author information
- Copyright and disclaimer

## Component Library

### Navigation Cards
- Rounded corners (rounded-lg)
- Padding: p-6
- Icon at top, title, description stacked vertically
- Subtle shadow, elevation on hover

### Reading Progress Bar
- Fixed to top of viewport
- Thin (h-1), fills as user scrolls through chapter
- Smooth animation

### Chapter Breadcrumbs
- Shows: Home > Chapter > Subchapter
- Always visible at top of content area

### Call-to-Action Boxes (Within Content)
- Bordered boxes with soft background
- Used for: Key takeaways, exercises, reflection prompts
- Icon + heading + content format

### Back-to-Top Button
- Fixed bottom-right
- Appears after scrolling 500px
- Rounded-full with icon

## Icons
**Library**: Heroicons (outline style for navigation, solid for emphasis)
- Chapter categories: Heart, Shield, Users, Home, Brain, etc.
- Navigation: ChevronRight, ArrowUp, Menu
- Actions: BookOpen, Search

## Images
**Hero Image**: Soft-focus nature photography - sunrise over calm water, misty forest path, or serene mountain landscape. Should evoke peace, hope, and new beginnings. Image should be high-quality but subtle, not distracting.

**Chapter Icons**: Use Heroicons instead of photos for chapter navigation for consistency and performance.

## Accessibility Requirements
- Minimum contrast ratio: 4.5:1 for all text
- Focus states: 2px solid ring on all interactive elements
- Skip-to-content link
- Semantic HTML5 structure (article, section, nav, aside)
- ARIA labels for navigation and progress indicators
- Smooth scroll behavior (scroll-behavior: smooth)

## Mobile Considerations
- Stack sidebar content below main content
- Larger touch targets (min 44x44px)
- Simplified navigation with drawer/hamburger menu
- Readable font sizes without zooming (min 16px base)
- Bottom navigation bar for chapter switching on mobile

## Animation Philosophy
**Minimal and Purposeful**: Avoid distracting animations for this sensitive content
- Subtle fade-ins on scroll (only for section reveals)
- Smooth transitions for navigation (300ms)
- Progress bar animation
- No parallax, no auto-playing elements, no sudden movements