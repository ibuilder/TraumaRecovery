import type { Chapter, BookInfo } from "@shared/schema";

export const bookInfo: BookInfo = {
  title: "Healing Together",
  subtitle: "A Practical Guide to Trauma Recovery for Ordinary People",
  author: "Recovery Works Publishing",
  description: "A comprehensive guide to understanding and healing from trauma, written for everyday people seeking practical, compassionate support on their healing journey.",
};

export const chapters: Chapter[] = [
  {
    id: "1",
    title: "Understanding Trauma & Basic Recovery",
    slug: "basic-recovery",
    description: "Learn the fundamentals of trauma and begin your healing journey with essential recovery principles.",
    icon: "Heart",
    order: 1,
    readingTime: "15 min read",
    content: `# Understanding Trauma & Basic Recovery

## What is Trauma?

Trauma is the emotional response to a deeply distressing or disturbing event that overwhelms an individual's ability to cope. It can result from a single incident or from repeated exposure to harmful experiences.

> "Trauma is not what happens to you. Trauma is what happens inside you as a result of what happens to you." — Gabor Maté

### Common Signs of Trauma

Recognizing trauma in ourselves is the first step toward healing. Common signs include:

- **Intrusive thoughts** or flashbacks to the event
- **Avoidance** of reminders of the trauma
- **Hypervigilance** and being easily startled
- **Emotional numbness** or feeling disconnected
- **Sleep disturbances** and nightmares
- **Difficulty concentrating** or remembering things

## The Basics of Recovery

Recovery is not a linear process. It involves ups and downs, progress and setbacks. Understanding this from the beginning helps set realistic expectations.

### The Three Pillars of Basic Recovery

1. **Safety First**: Establishing physical and emotional safety
2. **Stabilization**: Learning to manage symptoms and emotions
3. **Processing**: Working through traumatic memories when ready

### Building Your Foundation

Before diving deep into trauma work, it's essential to build a strong foundation:

- Establish a routine that includes self-care
- Identify and connect with supportive people
- Learn basic grounding techniques
- Practice self-compassion daily

## Grounding Techniques

When trauma responses arise, grounding can bring you back to the present moment.

### The 5-4-3-2-1 Technique

1. **5 things you can see** - Look around and name them
2. **4 things you can touch** - Feel different textures
3. **3 things you can hear** - Listen carefully
4. **2 things you can smell** - Notice scents around you
5. **1 thing you can taste** - What's in your mouth?

### Body Grounding

- Feel your feet firmly on the ground
- Notice the chair supporting your body
- Take slow, deep breaths
- Gently clench and release your muscles

## Moving Forward

Recovery takes courage. By reading this chapter, you've already taken an important step. Remember:

- Healing is possible
- You are not alone
- Progress happens one day at a time
- Setbacks are part of the journey, not the end of it`,
    subchapters: [
      {
        id: "1-1",
        title: "What is Trauma?",
        slug: "what-is-trauma",
        order: 1,
        content: `# What is Trauma?

Trauma fundamentally changes how we see ourselves, others, and the world. Understanding this is key to healing.

## Types of Trauma

### Acute Trauma
Results from a single distressing event, such as an accident, natural disaster, or assault.

### Chronic Trauma
Results from repeated and prolonged exposure to highly stressful events, such as ongoing abuse or neglect.

### Complex Trauma
Exposure to multiple traumatic events, often of an invasive, interpersonal nature.

## How Trauma Affects the Brain

When we experience trauma, our brain's alarm system (the amygdala) becomes hyperactive while our thinking brain (prefrontal cortex) goes offline. This is why trauma survivors often:

- React before thinking
- Have difficulty making decisions
- Experience memory problems
- Feel constantly on edge

Understanding these changes helps us approach healing with self-compassion rather than self-criticism.`,
      },
      {
        id: "1-2",
        title: "Grounding Techniques",
        slug: "grounding-techniques",
        order: 2,
        content: `# Grounding Techniques for Trauma Recovery

Grounding techniques help you stay connected to the present moment when trauma symptoms arise.

## Physical Grounding

### The Ice Cube Technique
Hold an ice cube in your hand. Focus on the cold sensation, how it feels as it melts, the water running between your fingers.

### Weighted Items
Use a weighted blanket or hold something heavy. The pressure can help calm the nervous system.

### Movement
- Walk barefoot on grass
- Do jumping jacks
- Stretch slowly and mindfully

## Mental Grounding

### Categories Game
Pick a category (colors, animals, cities) and try to think of as many items as possible.

### Math Exercises
Count backward from 100 by 7s. This engages your thinking brain.

### Describe Your Environment
Describe your surroundings in detail, as if explaining them to someone who can't see.

## Practice Makes Progress

Like any skill, grounding becomes easier with practice. Try different techniques to find what works best for you.`,
      },
    ],
  },
  {
    id: "2",
    title: "Addiction Recovery",
    slug: "addiction-recovery",
    description: "Understand the connection between trauma and addiction, and learn pathways to lasting recovery.",
    icon: "Shield",
    order: 2,
    readingTime: "18 min read",
    content: `# Addiction Recovery

## The Trauma-Addiction Connection

Many people who struggle with addiction are actually trying to cope with underlying trauma. Understanding this connection is crucial for lasting recovery.

> "Addiction is not a choice anyone makes. Addiction is not a moral failure. Addiction is a response to human suffering." — Dr. Gabor Maté

### Why Trauma Leads to Addiction

- Substances temporarily numb emotional pain
- Addictive behaviors provide a sense of control
- Addiction creates a predictable pattern in a chaotic internal world
- The high offers brief relief from chronic distress

## Understanding Your Addiction

### Common Addictive Patterns

- **Substance use**: Alcohol, drugs, prescription medications
- **Behavioral addictions**: Gambling, shopping, internet use
- **Process addictions**: Work, exercise, relationships

### The Cycle of Addiction

1. **Trigger**: Stress, emotions, or situations that create discomfort
2. **Craving**: The urge to use the substance or behavior
3. **Use**: Engaging in the addictive behavior
4. **Relief**: Temporary escape from pain
5. **Shame**: Guilt and self-criticism
6. **Return to trigger**: The cycle begins again

## Breaking the Cycle

### Harm Reduction Approach

Recovery doesn't always mean immediate abstinence. Harm reduction focuses on:

- Reducing the negative consequences of use
- Meeting people where they are
- Incremental progress toward healthier choices
- Building skills gradually

### Building New Coping Skills

To let go of addiction, we need alternative ways to cope:

- Healthy stress relief (exercise, creativity, nature)
- Emotional regulation techniques
- Connection with supportive others
- Addressing underlying trauma

## The Road to Recovery

Recovery is a journey of self-discovery and healing. It requires:

- Patience with yourself
- Professional support when needed
- A commitment to understanding your patterns
- Willingness to try new approaches`,
    subchapters: [
      {
        id: "2-1",
        title: "Understanding Triggers",
        slug: "understanding-triggers",
        order: 1,
        content: `# Understanding Your Triggers

Triggers are internal or external cues that spark the urge to use. Learning to identify and manage triggers is essential for recovery.

## Types of Triggers

### External Triggers
- People you used with
- Places associated with use
- Times of day or year
- Objects related to addiction
- Stressful situations

### Internal Triggers
- Difficult emotions (anger, sadness, loneliness)
- Physical sensations (pain, fatigue)
- Memories of trauma
- Negative self-talk

## Creating a Trigger Map

1. List your known triggers
2. Rate each trigger's intensity (1-10)
3. Identify warning signs for each
4. Develop a specific coping plan

## Responding to Triggers

### The HALT Method
Check if you're:
- **H**ungry
- **A**ngry
- **L**onely
- **T**ired

Address these basic needs first.

### Urge Surfing
Instead of fighting cravings, observe them like waves:
- Notice the urge rising
- Watch it peak
- Let it naturally subside
- Recognize that cravings pass`,
      },
      {
        id: "2-2",
        title: "Building a Support System",
        slug: "building-support",
        order: 2,
        content: `# Building Your Support System

Recovery is not meant to be a solo journey. A strong support system significantly increases your chances of lasting recovery.

## Types of Support

### Professional Support
- Therapists specializing in addiction and trauma
- Psychiatrists for medication management
- Recovery coaches or counselors
- Treatment programs (inpatient or outpatient)

### Peer Support
- 12-step programs (AA, NA, etc.)
- SMART Recovery groups
- Recovery Dharma
- Online recovery communities

### Personal Support
- Family members who understand recovery
- Friends who support your sobriety
- Mentors or sponsors
- Faith communities

## Building Healthy Relationships

### Setting Boundaries
- Learn to say no without guilt
- Limit contact with people who trigger use
- Protect your recovery time
- Communicate your needs clearly

### Being a Good Support Seeker
- Ask for specific help
- Express gratitude
- Be honest about struggles
- Reciprocate when possible

## When Support Feels Scary

For trauma survivors, trusting others can be terrifying. Start small:
- Share a little at a time
- Observe how people respond
- Build trust gradually
- It's okay to take breaks from groups`,
      },
    ],
  },
  {
    id: "3",
    title: "Dysfunctional Families",
    slug: "dysfunctional-families",
    description: "Recognize patterns from your family of origin and learn to break generational cycles.",
    icon: "Home",
    order: 3,
    readingTime: "20 min read",
    content: `# Healing from Dysfunctional Families

## Recognizing Family Dysfunction

Many of us grew up in families that didn't provide the safety, nurturing, and guidance we needed. Acknowledging this is often the first and hardest step.

### Signs of a Dysfunctional Family

- **Denial**: Problems are ignored or minimized
- **Rigid roles**: Family members are stuck in fixed patterns
- **Poor boundaries**: Privacy isn't respected
- **Unpredictability**: Rules and moods change without warning
- **Lack of empathy**: Feelings are dismissed or mocked
- **Control and manipulation**: Love is conditional

## Common Family Roles

Children in dysfunctional families often adopt survival roles:

### The Hero
- The overachiever who brings pride to the family
- Struggles with perfectionism and burnout
- Needs to learn that their worth isn't based on achievement

### The Scapegoat
- Blamed for family problems
- May act out to divert attention from other issues
- Needs to understand they weren't the problem

### The Lost Child
- Withdraws to avoid conflict
- Often overlooked and invisible
- Needs to learn they matter and have a voice

### The Mascot
- Uses humor to diffuse tension
- Avoids serious emotions
- Needs to learn it's safe to be vulnerable

## Breaking the Cycle

### Understanding Generational Patterns

Dysfunction is often passed down through generations. Recognizing these patterns helps us:
- Stop blaming ourselves
- Understand our parents' limitations
- Choose different paths for ourselves

### Reparenting Yourself

As adults, we can give ourselves what we didn't receive:
- Set healthy routines and structure
- Practice self-compassion
- Celebrate your accomplishments
- Comfort yourself during hard times

## Setting Boundaries with Family

Healing doesn't always mean reconciliation. Sometimes it means:
- Limiting contact
- Ending conversations that become harmful
- Taking breaks from family gatherings
- In some cases, cutting contact entirely

Your healing comes first.`,
    subchapters: [
      {
        id: "3-1",
        title: "Identifying Family Patterns",
        slug: "family-patterns",
        order: 1,
        content: `# Identifying Family Patterns

Understanding the patterns in your family helps you recognize how they've shaped you—and how to change.

## Genogram Exercise

A genogram is a family map that reveals patterns across generations.

### How to Create One
1. Draw three generations of your family
2. Note significant events, relationships, and issues
3. Look for patterns: addiction, mental illness, divorce, abuse
4. Notice relationship dynamics: close, distant, conflicted

## Common Dysfunctional Patterns

### Triangulation
When two people pull a third into their conflict instead of addressing issues directly.

### Enmeshment
When boundaries between family members are blurred, making it hard to have separate identities.

### Parentification
When children are forced to take on adult roles, caring for parents or siblings.

### Emotional Cutoff
When family members completely sever ties rather than address conflict.

## Your Role in the Pattern

Consider these questions:
- What role did you play in your family?
- How does that role show up in your current relationships?
- What beliefs about yourself did you develop?
- Which patterns do you want to change?`,
      },
      {
        id: "3-2",
        title: "Healthy Boundaries",
        slug: "healthy-boundaries",
        order: 2,
        content: `# Setting Healthy Boundaries

Boundaries define where you end and others begin. For those from dysfunctional families, learning boundaries is essential.

## What Are Healthy Boundaries?

Healthy boundaries are:
- Clear and specific
- Flexible but firm
- Based on your values
- Respectful to yourself and others

## Types of Boundaries

### Physical Boundaries
- Personal space
- Touch preferences
- Privacy needs

### Emotional Boundaries
- Protecting your feelings
- Not taking responsibility for others' emotions
- Limiting exposure to negativity

### Time Boundaries
- How you spend your time
- Saying no to excessive demands
- Protecting rest and self-care

### Mental Boundaries
- Your thoughts and opinions
- Not being talked out of your reality
- Intellectual autonomy

## How to Set Boundaries

### The Formula
"When you [specific behavior], I feel [emotion]. I need [what you need]. If [boundary is crossed], I will [consequence]."

### Example
"When you criticize my parenting in front of my kids, I feel hurt and undermined. I need you to share concerns with me privately. If it happens again, I will end the visit."

## Dealing with Pushback

People used to no boundaries often resist when you set them:
- Stay calm and repeat your boundary
- Don't justify, argue, defend, or explain (JADE)
- Follow through on consequences
- Seek support from others who respect boundaries`,
      },
    ],
  },
  {
    id: "4",
    title: "Childhood Trauma",
    slug: "childhood-trauma",
    description: "Understand how early experiences shape us and begin healing your inner child.",
    icon: "Baby",
    order: 4,
    readingTime: "22 min read",
    content: `# Healing Childhood Trauma

## The Impact of Early Trauma

Childhood trauma is particularly impactful because it occurs while our brains and personalities are still forming.

> "It is easier to build strong children than to repair broken adults." — Frederick Douglass

### Adverse Childhood Experiences (ACEs)

Research on ACEs shows that childhood trauma can include:

- Physical, emotional, or sexual abuse
- Physical or emotional neglect
- Household dysfunction (mental illness, incarceration, domestic violence)
- Parental separation or divorce
- Living with someone who abuses substances

### How ACEs Affect Development

Higher ACE scores are linked to:
- Mental health challenges
- Physical health problems
- Difficulty with relationships
- Struggles with work and finances

But having ACEs doesn't determine your future. Healing is possible.

## Understanding Your Inner Child

Your "inner child" represents the part of you that carries childhood wounds and needs.

### Signs of a Wounded Inner Child

- Difficulty regulating emotions
- Fear of abandonment
- People-pleasing tendencies
- Harsh self-criticism
- Difficulty trusting others
- Feeling fundamentally flawed

## Inner Child Healing Work

### Acknowledging the Pain

The first step is acknowledging that what happened to you was wrong and that your pain is valid.

### Connecting with Your Inner Child

- Look at childhood photos
- Write letters to your younger self
- Imagine comforting your child self
- Notice when your inner child is activated

### Reparenting Exercises

- Give yourself the nurturing you needed
- Set gentle structure and routines
- Celebrate small achievements
- Offer yourself unconditional acceptance

## Professional Support

Childhood trauma often requires professional help:
- Trauma-focused therapy
- EMDR (Eye Movement Desensitization and Reprocessing)
- Internal Family Systems (IFS) therapy
- Somatic therapies`,
    subchapters: [
      {
        id: "4-1",
        title: "Inner Child Work",
        slug: "inner-child-work",
        order: 1,
        content: `# Inner Child Healing Exercises

These exercises help you connect with and heal your wounded inner child.

## Letter Writing

### To Your Inner Child
Write a letter to yourself at a specific age when you experienced trauma. Tell that child:
- It wasn't your fault
- You didn't deserve what happened
- You are loved and valued
- You survived and are now safe

### From Your Inner Child
Write a letter as your child self to your adult self. What does your inner child need? What are they afraid of? What do they want you to know?

## Visualization Exercises

### Safe Place Imagery
1. Close your eyes and breathe deeply
2. Imagine a safe, peaceful place
3. See your child self there
4. Approach gently and ask what they need
5. Offer comfort and protection
6. Promise to return and keep them safe

### Nurturing Visualization
Imagine yourself as a loving parent figure caring for your inner child. See yourself:
- Holding them when they're scared
- Playing with them when they're joyful
- Protecting them from harm
- Celebrating their uniqueness

## Daily Inner Child Care

- Notice when your inner child is activated (strong emotions, feeling small)
- Pause and acknowledge their feelings
- Offer reassurance: "I'm here. You're safe now."
- Attend to unmet needs (comfort, play, rest)`,
      },
      {
        id: "4-2",
        title: "Breaking Free from Shame",
        slug: "breaking-from-shame",
        order: 2,
        content: `# Breaking Free from Shame

Children often internalize shame from traumatic experiences. Healing requires releasing shame that was never yours to carry.

## Understanding Shame

### Guilt vs. Shame
- **Guilt**: "I did something bad" (behavior-focused)
- **Shame**: "I am bad" (identity-focused)

### How Children Develop Shame
Children are egocentric—they believe everything relates to them. When bad things happen, they conclude they caused it or deserved it.

## The Shame Spiral

1. Something triggers shame
2. Negative self-talk intensifies
3. Physical sensations (hot face, heavy chest)
4. Urge to hide, isolate, or act out
5. Behaviors that create more shame

## Healing Shame

### Challenge Shame Messages
- Where did this belief come from?
- Whose voice is this really?
- Would I say this to someone I love?
- What would a compassionate friend say?

### Shame Resilience

1. **Recognize** shame when it arises
2. **Practice** self-compassion
3. **Reach out** to trusted others
4. **Speak** your shame (in safe spaces)

### Rewriting the Narrative
You are not what happened to you. You are not the names you were called. You are not the roles you were forced into.

You are worthy of love, respect, and healing—simply because you exist.`,
      },
    ],
  },
  {
    id: "5",
    title: "Adult Trauma",
    slug: "adult-trauma",
    description: "Navigate trauma that occurs in adulthood and develop resilience.",
    icon: "User",
    order: 5,
    readingTime: "16 min read",
    content: `# Healing from Adult Trauma

## Types of Adult Trauma

Trauma can occur at any stage of life. Common adult traumas include:

- Accidents and injuries
- Violent crimes or assault
- Natural disasters
- Medical trauma
- Sudden loss of loved ones
- Workplace trauma
- Military combat
- Community violence

## Unique Aspects of Adult Trauma

### Pre-existing Strengths
Adults bring coping skills and life experience to trauma recovery—resources that children lack.

### Shattered Assumptions
Adult trauma can shatter beliefs we've built about:
- The world being safe
- People being trustworthy
- Having control over our lives
- Justice and fairness

### Additional Responsibilities
Adults must cope while maintaining work, family, and other obligations.

## PTSD in Adults

### Common Symptoms
- Intrusive memories and flashbacks
- Avoidance of reminders
- Negative changes in mood and thinking
- Hyperarousal and reactivity

### When to Seek Help
If symptoms persist beyond a month and interfere with daily life, professional support is recommended.

## Building Resilience

### Protective Factors
- Strong social support
- Healthy coping strategies
- Sense of purpose
- Self-efficacy
- Flexibility and adaptability

### Post-Traumatic Growth
Many trauma survivors experience positive changes:
- Deeper appreciation for life
- Closer relationships
- Greater personal strength
- New possibilities
- Spiritual development

This doesn't minimize the pain—both can coexist.`,
    subchapters: [
      {
        id: "5-1",
        title: "Processing Recent Trauma",
        slug: "processing-recent-trauma",
        order: 1,
        content: `# Processing Recent Trauma

If you've experienced trauma recently, here's guidance for the early stages of recovery.

## The First Days and Weeks

### Normal Reactions
It's normal to experience:
- Shock and disbelief
- Confusion and disorientation
- Intense emotions or numbness
- Physical symptoms (fatigue, headaches, nausea)
- Sleep disturbances
- Difficulty concentrating

### What Helps
- **Safety first**: Ensure your physical safety
- **Basic needs**: Eat, sleep, and rest even if difficult
- **Social support**: Connect with trusted people
- **Limit exposure**: Avoid news coverage and retelling repeatedly
- **Routine**: Maintain normal activities when possible

### What to Avoid
- Major life decisions
- Excessive alcohol or substances
- Isolating completely
- Suppressing all emotions
- Pressuring yourself to "be over it"

## When to Seek Immediate Help

Reach out to a professional if you experience:
- Thoughts of suicide or self-harm
- Inability to care for yourself
- Severe dissociation
- Panic attacks
- Symptoms that worsen over time

## The Weeks and Months Ahead

Recovery is a process. Give yourself time and compassion. Most people see significant improvement within three months, but everyone's timeline is different.`,
      },
      {
        id: "5-2",
        title: "Building Resilience",
        slug: "building-resilience",
        order: 2,
        content: `# Building Resilience After Trauma

Resilience isn't about being tough or pushing through. It's about recovering, adapting, and growing.

## The Pillars of Resilience

### Connection
- Maintain supportive relationships
- Join communities aligned with your values
- Ask for and accept help
- Be willing to give support to others

### Wellness
- Prioritize physical health
- Practice stress management
- Engage in activities that bring joy
- Maintain routines and structure

### Healthy Thinking
- Keep perspective during difficulties
- Accept that change is part of life
- Maintain hope for the future
- Learn from past challenges

### Meaning
- Help others in meaningful ways
- Pursue activities that matter to you
- Connect with spiritual or philosophical beliefs
- Set and work toward goals

## Resilience-Building Practices

### Daily Habits
- Gratitude practice
- Physical movement
- Mindfulness or meditation
- Connection with others
- Adequate sleep

### During Difficulties
- Break problems into manageable pieces
- Take decisive action where possible
- Look for opportunities for growth
- Keep long-term perspective

## Remember
Resilience develops over time. Each challenge you navigate builds capacity for the next. You are already more resilient than you know.`,
      },
    ],
  },
  {
    id: "6",
    title: "Relationship Trauma",
    slug: "relationship-trauma",
    description: "Heal from betrayal, abuse, and unhealthy relationship patterns.",
    icon: "Heart",
    order: 6,
    readingTime: "19 min read",
    content: `# Healing from Relationship Trauma

## Understanding Relationship Trauma

Relationship trauma occurs when our connections with others—meant to be sources of safety—become sources of harm.

### Types of Relationship Trauma

- **Intimate partner violence**: Physical, emotional, or sexual abuse
- **Betrayal trauma**: Infidelity, deception, or broken trust
- **Abandonment**: Being left by those we depend on
- **Enmeshment**: Loss of self in relationships
- **Toxic relationships**: Manipulation, control, gaslighting

## Trauma Bonding

### What Is a Trauma Bond?

A trauma bond is an emotional attachment formed through cycles of abuse and intermittent reinforcement.

### Signs of Trauma Bonding
- Defending or making excuses for the abuser
- Feeling unable to leave despite harm
- Confusion about what's real
- Loss of sense of self
- Isolation from others

### Breaking Trauma Bonds
- Recognize the cycle
- Build outside support
- Limit or end contact
- Process feelings with a professional
- Be patient with yourself

## Attachment and Relationships

### How Trauma Affects Attachment

Early relationship trauma can create:
- **Anxious attachment**: Fear of abandonment, clinginess
- **Avoidant attachment**: Distancing, fear of intimacy
- **Disorganized attachment**: Conflicting needs for closeness and distance

### Healing Attachment Wounds
- Understand your attachment style
- Recognize patterns in relationships
- Practice secure relating skills
- Work with a therapist on attachment repair

## Moving Forward

Relationship trauma doesn't mean you're doomed in love. Healing is possible, and healthy relationships are achievable with awareness, work, and the right support.`,
    subchapters: [
      {
        id: "6-1",
        title: "Recognizing Toxic Patterns",
        slug: "toxic-patterns",
        order: 1,
        content: `# Recognizing Toxic Relationship Patterns

Learning to identify unhealthy dynamics is essential for protecting yourself and choosing healthier relationships.

## Red Flags in Relationships

### Control and Manipulation
- Telling you what to wear, who to see, or where to go
- Making decisions for you
- Using guilt or threats to influence you
- Gaslighting—making you question your reality

### Emotional Abuse
- Constant criticism and put-downs
- Name-calling and insults
- Dismissing your feelings
- Withholding affection as punishment

### Isolation
- Cutting you off from friends and family
- Creating conflict with your support system
- Making you financially dependent
- Demanding all your time and attention

## Patterns to Watch

### The Cycle of Abuse
1. **Tension building**: Walking on eggshells
2. **Incident**: Abuse occurs
3. **Reconciliation**: Apologies, promises, gifts
4. **Calm**: The "honeymoon" phase
5. **Return to tension**: Cycle repeats

### Love Bombing
Overwhelming attention and affection early in a relationship—often a setup for later control.

## Trusting Your Instincts

If something feels wrong, it probably is. You don't need to justify your discomfort. Your feelings are valid data.`,
      },
      {
        id: "6-2",
        title: "Rebuilding Trust",
        slug: "rebuilding-trust",
        order: 2,
        content: `# Rebuilding Trust After Betrayal

Trust, once broken, can be rebuilt—but it requires intention, time, and often professional support.

## Understanding Broken Trust

### The Impact of Betrayal
- Shatters assumptions about the relationship
- Creates hypervigilance
- Triggers grief for the relationship you thought you had
- Can reactivate past traumas

### What Trust Requires to Rebuild
- Full acknowledgment of harm
- Genuine remorse and accountability
- Changed behavior over time
- Patience and commitment from both parties
- Professional support when needed

## Rebuilding Trust in Yourself

Before trusting others, we often need to rebuild trust in ourselves.

### Self-Trust Practices
- Keep promises you make to yourself
- Honor your feelings and needs
- Set and maintain boundaries
- Forgive yourself for past choices

### Learning from Experience
- What red flags did you overlook?
- What patterns attracted you to this person?
- What boundaries do you need to strengthen?
- What support do you need going forward?

## When Trust Cannot Be Rebuilt

Sometimes the healthiest choice is to not rebuild trust. This is okay when:
- Abuse continues
- There's no genuine accountability
- Your safety is at risk
- The cost of staying exceeds the benefit

Choosing yourself is not failure—it's wisdom.`,
      },
    ],
  },
  {
    id: "7",
    title: "Cognitive Behavioral Therapy (CBT)",
    slug: "cbt",
    description: "Learn practical CBT techniques to change unhelpful thinking patterns.",
    icon: "Brain",
    order: 7,
    readingTime: "17 min read",
    content: `# Cognitive Behavioral Therapy (CBT)

## What Is CBT?

Cognitive Behavioral Therapy is an evidence-based approach that helps you identify and change unhelpful thought patterns and behaviors.

### The CBT Triangle

Our thoughts, feelings, and behaviors are interconnected:

- **Thoughts** influence feelings and behaviors
- **Feelings** influence thoughts and behaviors
- **Behaviors** influence thoughts and feelings

By changing one, we can influence the others.

## Cognitive Distortions

These are common thinking errors that trauma survivors often experience:

### All-or-Nothing Thinking
Seeing things in black and white, with no middle ground.
*Example: "If I'm not perfect, I'm a complete failure."*

### Catastrophizing
Expecting the worst possible outcome.
*Example: "If I make a mistake, my life will be ruined."*

### Mind Reading
Assuming you know what others think.
*Example: "Everyone thinks I'm weird."*

### Personalization
Taking responsibility for things outside your control.
*Example: "My parents divorced because of me."*

### Emotional Reasoning
Believing feelings are facts.
*Example: "I feel worthless, so I must be worthless."*

### Should Statements
Rigid rules about how things must be.
*Example: "I should always be strong."*

## CBT Techniques

### Thought Records
1. Describe the situation
2. Identify the automatic thought
3. Note the emotion and intensity
4. Find evidence for and against the thought
5. Create a balanced alternative thought
6. Rate the new emotion

### Behavioral Experiments
Test your beliefs in real life to see if they hold up.

### Behavioral Activation
When depressed, doing activities can lift mood—even when you don't feel like it.

## Applying CBT to Trauma

CBT helps trauma survivors:
- Challenge self-blame
- Reduce avoidance behaviors
- Process traumatic memories
- Build healthier coping strategies`,
    subchapters: [
      {
        id: "7-1",
        title: "Challenging Negative Thoughts",
        slug: "challenging-thoughts",
        order: 1,
        content: `# Challenging Negative Thoughts

Learning to identify and challenge unhelpful thoughts is a core CBT skill.

## The Thought Record Process

### Step 1: Situation
Describe what happened. Be specific and objective.
*Example: "My friend didn't respond to my text for 24 hours."*

### Step 2: Automatic Thought
What went through your mind?
*Example: "She's ignoring me. I must have done something wrong. She doesn't want to be my friend anymore."*

### Step 3: Emotion
What did you feel, and how intensely (0-100)?
*Example: "Anxious (80), Sad (70), Hurt (65)"*

### Step 4: Evidence For
What supports this thought?
*Example: "She usually responds faster. She seemed distant last time we talked."*

### Step 5: Evidence Against
What contradicts this thought?
*Example: "She's been busy with work. She's been a good friend for years. I haven't done anything wrong that I know of."*

### Step 6: Balanced Thought
What's a more realistic perspective?
*Example: "She's probably just busy. If there's an issue, she'll tell me. One delayed text doesn't mean our friendship is over."*

### Step 7: New Emotion
How do you feel now (0-100)?
*Example: "Anxious (30), Sad (20)"*

## Practice Tips
- Write it out—don't just think it through
- Be curious, not judgmental
- Practice daily, even with minor situations
- The goal isn't positive thinking—it's realistic thinking`,
      },
      {
        id: "7-2",
        title: "Behavioral Strategies",
        slug: "behavioral-strategies",
        order: 2,
        content: `# CBT Behavioral Strategies

Changing behavior is often the fastest way to change thoughts and feelings.

## Behavioral Activation

When we're struggling, we tend to withdraw and avoid. This creates a downward spiral:
Less activity → Lower mood → Less motivation → Even less activity

### Breaking the Cycle
1. **Track activities**: Note what you do and how you feel
2. **Identify patterns**: What activities boost your mood?
3. **Schedule activities**: Plan enjoyable and meaningful activities
4. **Start small**: Even tiny steps count
5. **Do it anyway**: Don't wait for motivation

### Activity Categories
- **Pleasure activities**: Things you enjoy
- **Mastery activities**: Things that give accomplishment
- **Values-based activities**: Things aligned with what matters to you

## Exposure Therapy

Avoiding trauma reminders keeps fear alive. Gradual exposure helps reduce fear.

### How Exposure Works
1. Create a fear hierarchy (0-100)
2. Start with the lowest item
3. Stay in the situation until anxiety decreases
4. Move up the hierarchy gradually
5. Repeat until the situation no longer triggers fear

### Types of Exposure
- **Imaginal**: Imagining the feared situation
- **In vivo**: Real-life exposure
- **Interoceptive**: Exposure to physical sensations

### Safety Notes
Exposure should be done with professional guidance for trauma. It's powerful but needs to be paced appropriately.`,
      },
    ],
  },
  {
    id: "8",
    title: "Dialectical Behavior Therapy (DBT)",
    slug: "dbt",
    description: "Master emotional regulation and distress tolerance with DBT skills.",
    icon: "Waves",
    order: 8,
    readingTime: "18 min read",
    content: `# Dialectical Behavior Therapy (DBT)

## What Is DBT?

DBT was developed for people who experience emotions intensely. It combines acceptance with change strategies.

### The Dialectic
DBT embraces paradox: You can accept yourself as you are AND work on changing. Both are true simultaneously.

## The Four DBT Skill Modules

### 1. Mindfulness
Being present and aware without judgment.

**Core Skills:**
- Observe: Notice without reacting
- Describe: Put experiences into words
- Participate: Fully engage in the moment

**How Skills:**
- Non-judgmentally: Without evaluating as good or bad
- One-mindfully: Focusing on one thing at a time
- Effectively: Doing what works

### 2. Distress Tolerance
Surviving crises without making things worse.

**TIPP Skills:**
- **T**emperature: Cold water on face
- **I**ntense exercise: Brief, vigorous activity
- **P**aced breathing: Slow exhales
- **P**aired muscle relaxation: Tense and release

**Radical Acceptance:**
Accepting reality as it is, even when painful.

### 3. Emotion Regulation
Understanding and managing intense emotions.

**Key Skills:**
- Identify and label emotions
- Understand the function of emotions
- Reduce emotional vulnerability
- Increase positive emotions

### 4. Interpersonal Effectiveness
Maintaining relationships while honoring needs.

**DEAR MAN:**
- **D**escribe the situation
- **E**xpress feelings
- **A**ssert what you want
- **R**einforce the benefit
- **M**indful of goals
- **A**ppear confident
- **N**egotiate if needed`,
    subchapters: [
      {
        id: "8-1",
        title: "Distress Tolerance Skills",
        slug: "distress-tolerance",
        order: 1,
        content: `# DBT Distress Tolerance Skills

These skills help you survive emotional crises without making things worse.

## Crisis Survival Skills

### STOP Skill
When emotions are overwhelming:
- **S**top: Don't react immediately
- **T**ake a step back: Create space
- **O**bserve: Notice what's happening
- **P**roceed mindfully: Choose wisely

### TIPP Skills
Change your body chemistry to change your emotions:

**Temperature**
Splash cold water on your face or hold ice. This triggers the dive reflex, slowing your heart rate.

**Intense Exercise**
Even 20 minutes of intense movement can reset your emotional state.

**Paced Breathing**
Slow your exhale to be longer than your inhale. Try breathing in for 4, out for 6-8.

**Paired Muscle Relaxation**
Tense muscle groups for 5 seconds, then release. Work through your body systematically.

## Distraction (ACCEPTS)

- **A**ctivities: Do something engaging
- **C**ontributing: Help others
- **C**omparisons: Gain perspective
- **E**motions: Watch something funny or moving
- **P**ushing away: Mentally set aside temporarily
- **T**houghts: Count, do puzzles
- **S**ensations: Strong physical sensations

## Self-Soothing

Comfort yourself through your senses:
- **Vision**: Beautiful images
- **Hearing**: Music, nature sounds
- **Smell**: Favorite scents
- **Taste**: Comforting foods
- **Touch**: Soft textures, warmth`,
      },
      {
        id: "8-2",
        title: "Emotion Regulation",
        slug: "emotion-regulation",
        order: 2,
        content: `# DBT Emotion Regulation Skills

Learn to understand and manage your emotional experiences.

## Understanding Emotions

### The Function of Emotions
All emotions serve a purpose:
- **Fear**: Protects from danger
- **Anger**: Signals boundary violations
- **Sadness**: Processes loss
- **Shame**: Maintains social bonds
- **Joy**: Reinforces what's good

### The Emotion Wave
Emotions naturally rise, peak, and fall. If we ride the wave without acting impulsively, emotions will pass.

## Reducing Vulnerability (ABC PLEASE)

### ABC Skills
- **A**ccumulate positives: Do things you enjoy
- **B**uild mastery: Do challenging things
- **C**ope ahead: Plan for difficult situations

### PLEASE Skills
Take care of your body:
- **PL**: Treat physical illness
- **E**: Balanced eating
- **A**: Avoid mood-altering substances
- **S**: Balance sleep
- **E**: Get exercise

## Opposite Action

When emotions don't fit the facts, act opposite to the urge:
- **Fear**: Approach instead of avoid
- **Sadness**: Get active instead of withdraw
- **Anger**: Be gentle instead of attack
- **Shame**: Make public instead of hide

## Check the Facts

Before acting on emotion:
1. What event triggered the emotion?
2. What are my interpretations?
3. Am I assuming the worst?
4. Does the intensity fit the facts?
5. What's the most effective response?`,
      },
    ],
  },
  {
    id: "9",
    title: "Acceptance & Commitment Therapy (ACT)",
    slug: "act",
    description: "Find psychological flexibility through acceptance and values-based living.",
    icon: "Compass",
    order: 9,
    readingTime: "16 min read",
    content: `# Acceptance and Commitment Therapy (ACT)

## What Is ACT?

ACT (pronounced "act") is about accepting what's outside your control while committing to actions that enrich your life.

### The Goal of ACT
The goal isn't to feel better—it's to get better at feeling. ACT helps you:
- Accept your reactions and be present
- Choose a valued direction
- Take action

## The Six Core Processes

### 1. Acceptance
Opening up to difficult feelings rather than fighting them.

This doesn't mean liking or wanting pain—it means making room for it so it doesn't control you.

### 2. Cognitive Defusion
Stepping back from thoughts rather than being fused with them.

Instead of "I am worthless," notice: "I'm having the thought that I am worthless."

### 3. Present Moment Awareness
Being here now, rather than lost in the past or worried about the future.

### 4. Self-as-Context
You are not your thoughts, feelings, or experiences. You are the awareness behind them.

### 5. Values
What matters most to you? Values are like a compass—they give direction.

### 6. Committed Action
Taking concrete steps aligned with your values, even when it's hard.

## The ACT Matrix

The matrix helps clarify what matters:

**Internal experiences** (thoughts, feelings, sensations)
**External behaviors** (what you do)
**Toward values** (moving toward what matters)
**Away from pain** (avoiding discomfort)

The goal is to spend more time in "toward values" behaviors.`,
    subchapters: [
      {
        id: "9-1",
        title: "Values Clarification",
        slug: "values-clarification",
        order: 1,
        content: `# Clarifying Your Values

Values are your heart's deepest desires for how you want to be in the world.

## Values vs. Goals

### Values
- Directions, like "North"
- Ongoing, never fully achieved
- About who you want to be
- Process-oriented

### Goals
- Destinations
- Achievable and completable
- About what you want to do or have
- Outcome-oriented

## Exploring Your Values

### Life Domains
Consider what matters in these areas:
- Family relationships
- Romantic relationships
- Friendships
- Work/career
- Education/learning
- Recreation/hobbies
- Spirituality
- Community/citizenship
- Health/wellbeing
- Environment/nature

### Clarifying Questions
- If you had no fear, how would you spend your time?
- What do you want your life to stand for?
- What qualities do you admire in others?
- At the end of your life, what will have mattered?
- When have you felt most alive?

## Writing Values Statements

Turn your values into clear statements:
- "I value being a loving, present parent"
- "I value contributing meaningfully to my community"
- "I value continuous learning and growth"
- "I value honesty in my relationships"

## Living Your Values

Values are lived through action. Ask yourself:
- What would someone who holds this value do today?
- What small step can I take toward this value?
- How can I bring this value to difficult situations?`,
      },
      {
        id: "9-2",
        title: "Defusion Techniques",
        slug: "defusion-techniques",
        order: 2,
        content: `# Cognitive Defusion Techniques

Defusion helps you step back from thoughts so they have less power over you.

## Understanding Fusion

When fused with thoughts:
- We believe thoughts are literally true
- We take thoughts very seriously
- We let thoughts dictate our actions
- We see thoughts as commands or threats

## Defusion Techniques

### "I'm Having the Thought That..."
Preface thoughts with this phrase:
*Instead of: "I'm a failure"*
*Try: "I'm having the thought that I'm a failure"*

### Singing Thoughts
Sing negative thoughts to a silly tune (like "Happy Birthday"). This changes your relationship to the thought.

### Thanking Your Mind
"Thanks, mind, for that thought!"
This acknowledges the thought without buying into it.

### Leaves on a Stream
Imagine sitting by a stream with leaves floating by. Place each thought on a leaf and watch it drift away.

### Computer Pop-Ups
See thoughts as annoying pop-up ads. You don't have to click on them—just notice and close.

### Naming the Story
"Ah, there's the 'I'm not good enough' story again."
Recognizing familiar thought patterns reduces their impact.

## The Goal of Defusion

Not to get rid of thoughts or make them go away. Just to hold them more lightly so you can:
- See thoughts as just thoughts
- Choose how to respond
- Act according to your values

## Practice

Pick one defusion technique and practice with minor botherssome thoughts before applying to bigger ones.`,
      },
    ],
  },
  {
    id: "10",
    title: "Spirituality in Recovery",
    slug: "spirituality",
    description: "Explore the spiritual dimension of healing and find deeper meaning.",
    icon: "Sun",
    order: 10,
    readingTime: "15 min read",
    content: `# Spirituality in Recovery

## What Is Spirituality?

Spirituality is deeply personal. It can include:
- Connection to something larger than yourself
- A sense of meaning and purpose
- Inner peace and contentment
- Connection with nature, others, or the divine
- Practices that nurture your soul

Spirituality is not necessarily religious, though it can include religion.

## Trauma and Spirituality

### How Trauma Affects Spirituality
Trauma can:
- Shatter faith or beliefs
- Create anger toward the divine
- Lead to existential questioning
- Cause spiritual disconnection
- Challenge beliefs about justice and meaning

### Spiritual Injury
When trauma violates our deepest beliefs about the world, we may experience moral or spiritual injury—a wound to our sense of meaning.

## Spiritual Paths to Healing

### Meaning-Making
Finding meaning in suffering doesn't mean it was good or deserved—it means we can grow from it.

Questions to explore:
- What has this experience taught me?
- How have I grown or changed?
- What strengths have emerged?
- How can I use my experience to help others?

### Forgiveness
Forgiveness is not:
- Condoning what happened
- Forgetting or minimizing
- Reconciliation
- A one-time event

Forgiveness is:
- Releasing resentment for your own peace
- A process that unfolds over time
- A gift to yourself

### Gratitude Practice
Even in pain, gratitude can shift perspective:
- Three things you're grateful for daily
- Gratitude letters to others
- Noticing small moments of beauty

### Connection
Spirituality often involves connection:
- To nature
- To community
- To ancestors or traditions
- To the sacred however you define it`,
    subchapters: [
      {
        id: "10-1",
        title: "Finding Meaning",
        slug: "finding-meaning",
        order: 1,
        content: `# Finding Meaning After Trauma

Viktor Frankl, a Holocaust survivor, wrote: "Those who have a 'why' to live can bear almost any 'how.'"

## Post-Traumatic Growth

While trauma is devastating, many survivors experience growth:

### Areas of Growth
- **Personal strength**: Discovering resilience you didn't know you had
- **New possibilities**: Seeing new paths and opportunities
- **Relating to others**: Deeper empathy and connection
- **Appreciation for life**: Gratitude for simple things
- **Spiritual change**: Deepened or transformed spirituality

### Growth Doesn't Erase Pain
Both can coexist:
- You can grieve what happened AND find meaning
- You can wish it hadn't happened AND be grateful for growth
- You can hurt deeply AND experience transformation

## Creating Meaning

### Through Action
- Helping others who face similar challenges
- Advocacy and awareness work
- Creating art, writing, or other expression
- Living fully in honor of what you've survived

### Through Narrative
The stories we tell about our lives shape our experience:
- You are not just a victim—you are a survivor
- Your story includes pain AND strength
- You have the power to write the next chapters

### Through Purpose
- What do you want to contribute to the world?
- How can your experience serve others?
- What legacy do you want to leave?

## Meaning Is Unique

There's no right way to find meaning. Your path is your own. Some find it through faith, others through service, creativity, relationships, or nature.

Trust your journey.`,
      },
      {
        id: "10-2",
        title: "Spiritual Practices",
        slug: "spiritual-practices",
        order: 2,
        content: `# Spiritual Practices for Healing

Explore these practices to nurture your spiritual wellbeing.

## Meditation and Contemplation

### Mindfulness Meditation
- Sit comfortably and focus on breath
- Notice thoughts without judgment
- Return attention when it wanders
- Start with 5 minutes daily

### Loving-Kindness Meditation
Send wishes of wellbeing:
1. To yourself
2. To someone you love
3. To a neutral person
4. To someone difficult
5. To all beings

### Contemplative Prayer
If you're religious:
- Centering prayer
- Lectio Divina
- Rosary or mala beads
- Silent sitting in presence

## Connection with Nature

Nature can be profoundly healing:
- Walk in natural settings
- Garden or tend plants
- Watch sunrise or sunset
- Listen to water, birds, wind
- Lie on the earth and feel held

## Creative Expression

Create without judgment:
- Journaling
- Art-making
- Music and singing
- Dance and movement
- Poetry and writing

## Rituals and Ceremonies

Create meaningful rituals:
- Morning intentions
- Evening gratitude
- Marking transitions and milestones
- Honoring losses
- Celebrating healing

## Community

Consider spiritual community:
- Religious congregation
- Meditation or yoga group
- Recovery fellowship
- Circle or study group
- Service organization

## Finding Your Path

Experiment with different practices:
- What resonates with you?
- What brings peace?
- What connects you to something larger?
- What nurtures your soul?

There's no wrong way to tend your spirit.`,
      },
    ],
  },
];
