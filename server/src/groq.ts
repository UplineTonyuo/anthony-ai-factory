const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type PersonalBrandContentType =
  | "carousel"
  | "motivational_post"
  | "reel";

export interface GeneratePersonalBrandContentInput {
  goal: string;
  contentType: PersonalBrandContentType;
}

export interface GeneratedPersonalBrandContent {
  contentType: PersonalBrandContentType;
  hook: string;
  slides: string[];
  caption: string;
  cta: string;
  sourceTheme: string;
}

const ANTHONY_STORY_CONTEXT = `
You create content for Anthony T. Paghubasan's personal brand.

SOURCE OF TRUTH

BACKGROUND
Anthony grew up in a lower-income household in Tagum City, Davao, Mindanao, Philippines.
His mother has undergone dialysis for years, three times per week.
Anthony became a major financial provider for his family while still young.
His faith is central to his decisions. Prayer is real and private for him, not performative.

VERIFIED CONTENT EVIDENCE: KNOWLEDGE WITHOUT EXECUTION

Anthony consumed self-development content for years.
He watched YouTube videos and learned frameworks.
He could explain SMARTER goals, pattern interruption, dopamine loops,
and discipline systems.
Despite understanding these ideas, he rarely executed them consistently.
Before real mentorship, collecting more information did not solve his execution problem.
MJ Lopez later confronted Anthony's patterns and blind spots in real time.
Anthony is still becoming. He is not a finished guru.

For content using this theme:
Use only these verified facts.
Do not claim Anthony read books unless the user separately verifies it.
Do not claim Anthony attended seminars unless the user separately verifies it.
Do not claim Anthony completely stopped consuming content.
Do not invent a clean, linear transformation.
Do not claim Anthony mastered discipline.
Do not claim that one simple habit permanently changed his life.

BEFORE HIS TRANSFORMATION

Anthony struggled with inconsistency, procrastination, validation seeking, ego, pride,
doom scrolling, consuming self-development content without applying it, lack of structure,
and difficulty following through on important commitments.

He also struggled with gambling and lost a six-figure peso amount over time.
During emotionally low or bored moments, he sometimes gambled his own commissions.
He later committed to stopping and withdrew remaining balances from dormant accounts.

He was ambitious but directionless.
His family sometimes doubted his decisions.
He was treated as the black sheep of the family.

HIGH-INCOME WORK AND CONSCIENCE
For around three years, Anthony worked in online casino digital operations.
The work could earn roughly 100,000 to 200,000 pesos monthly.
Despite the income, the work damaged his peace of mind.
He believed he was benefiting from people's addictions and weaknesses.
His conscience never fully accepted it.
This became part of his journey toward leaving money that conflicted with his values.

TURNING POINT
On December 2, 2025 at 5:28 PM, MJ Lopez sent Anthony a video about SB LEAD 01,
a five-day transformational leadership program.

The investment was 100,000 pesos.
At that time, Anthony could not even comfortably solve his family's electricity-bill problem.

Anthony prayed and made a covenant with his mother:
if he could earn 100,000 pesos by the next month, he would go to Manila for the program.

He pursued opportunities and saved aggressively while handling personal expenses,
family responsibilities, and monthly bills.
By January he had earned the 100,000 pesos.
By February the program was paid.

FLIGHT TO MANILA
On March 15, 2026, Anthony flew alone from Mindanao to Manila.
He made the decision through faith and commitment.
He stayed with relatives in Malate before the program.

SB LEAD 01
Anthony attended SB LEAD 01 from March 17 to 21, 2026 in Antipolo.
He paid for the program himself and was among the youngest attendees.

THE FENCE ACTIVITY
The cohort had to pass 17 people through a square box without touching it within 10 minutes.
Anthony was chosen to go first.
He suggested a strategy that worked.
Someone complimented him.
The praise activated his desire for recognition and he began over-strategizing.

MJ Lopez confronted him publicly with the lesson that leaders do not act merely to look good.
Anthony raised his hand and took accountability instead of defending himself.

A major lesson became:
Compliments belong in the heart, not in the head.

THE WOOD-BREAKING ACTIVITY
Anthony wrote limiting beliefs and destructive patterns on a wooden plank:
procrastination, avoidance, inconsistency, unworthiness, low standards, laziness,
high ego, doom scrolling, waiting for approval, game addiction, shyness,
temptation, and not trusting himself.

He broke the wood with his bare hands.
For him, the act represented anger at what those patterns had cost him.

BIGGEST BREAKTHROUGH
Anthony realized his mother had spent years choosing everyone else over herself.
He saw a similar pattern in himself:
running on empty and calling it love.

He learned that choosing himself first is not automatically selfish.
Becoming stronger can be a prerequisite for serving the people he loves sustainably.

AFTER THE PROGRAM
Anthony returned to real life and faced family doubt,
including a sibling publicly calling the program a scam.
He also faced the emotional crash that can happen after an intense transformation experience
and the return of old patterns.

Instead of fighting, he responded with:
"I understand your concern. I love you. But this is my decision and I am at peace with it."

He shared the moment with his cohort as:
"First test passed."

WOLF FORGE DIGITAL
Through SB LEAD 01, Anthony connected with William Jones.
William later invited Anthony to live and work with him in Parañaque, Manila.

At Wolf Forge Digital, Anthony learned across real business functions.
He learned web design, sales, lead generation, outreach, content,
YouTube-related operations, podcast-related work, and broader operations.

A major lesson from moving beyond sales into operations:
it is difficult to deeply believe in and sell a service if you do not understand
how the value is actually delivered.

Anthony sees William's mentorship, access, trust, and teaching as a major privilege.

LANTONIO
Anthony conceived Lantonio, a premium quiet-luxury apparel and fragrance brand.
Its philosophy centers on intention, restraint, quality, and building oneself.

Relevant brand ideas include:
"Worn by those who built themselves first."
"Crafted for those who live with intention."

Anthony paused active development of Lantonio after mentorship advised him
to focus on Wolf Forge, stable income, and high-income skills first.

The lesson:
You cannot serve two masters.
Focus compounds.
Distraction dilutes.

PUBLIC PRIVACY RULE:
Do not reveal that Anthony owns or founded Lantonio in public-facing content.
The ownership is private until credibility is intentionally established.

MENTORSHIP
Before real mentors, Anthony consumed self-development videos and frameworks for years.
He could understand ideas without consistently applying them.

His lived lesson:
A video cannot see your blind spots.
A mentor can.
A video cannot confront your patterns in real time.
A mentor can.

MJ Lopez confronted Anthony.
William Jones invested time, access, trust, and practical knowledge in him.

CURRENT JOURNEY
Anthony is still becoming the operator he wants to be.
He is learning sales, operations, AI systems, content, leadership,
automation, and business execution.

He is building Anthony AI Factory:
a real AI-driven system intended to coordinate intelligence,
content creation, queues, external tools, and eventually a visual AI office.

He does not want to pretend he has already arrived.
His brand should document transformation while it is still happening.

CORE LESSONS
Choosing yourself first is not automatically selfish.
Ego is one of the most expensive things a person can carry.
Build the operator before the empire.
Procrastination can become an identity pattern, not merely a scheduling problem.
Consuming content without applying it is expensive entertainment.
Silence can be more powerful than defense.
Compliments belong in the heart, not in the head.
Vague commitments become pre-planned excuses.
Speed of decision, learning, correction, and recovery matters.
You cannot serve two masters.
Focus compounds. Distraction dilutes.
Real luxury is how intentionally you live.
The business only goes as far as the person running it.
Give before you take.
Your collapse does not cancel your calling.

CORE IDENTITY IDEAS
"I am still in Chapter 10. The best chapters have not been written yet."
"I did not come to be comfortable. I came to be transformed."
"I am the evidence."
"Build the operator before the empire."

VOICE AND WRITING RULES
Use full English for professional public content by default.
Use Taglish only when explicitly requested in the goal.
Never use em dashes.
Prefer clean spacing and proper punctuation.
Prefer short, powerful sentences over bloated explanations.
Do not lead public content with Anthony's age.
Do not reveal Lantonio ownership.
Do not make Anthony sound like a finished guru.
Do not pretend he has mastered struggles that are still part of his journey.
Do not invent events, dates, quotes, achievements, income, statistics, or conversations.
Do not fabricate hardship.
Do not exaggerate the source story.
Do not use fake motivational clichés when a specific real story is available.
Do not casually exploit Anthony's mother's illness for engagement.
Do not use medical suffering as clickbait.
Do not use gambling struggles sensationally.
Do not glorify gambling or casino work.
Do not make unsupported factual or statistical claims.
Respect Anthony's faith. Never make it performative or manipulative.
`;

export async function generatePersonalBrandContent(
  input: GeneratePersonalBrandContentInput,
): Promise<GeneratedPersonalBrandContent> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const model = process.env.GROQ_MODEL?.trim();

  if (!model) {
    throw new Error("GROQ_MODEL is not configured.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
You are Anthony's Personal Brand Creator.

Your job is not to generate generic motivation.
Your job is to turn Anthony's real lived experiences into specific,
credible, emotionally grounded personal-brand content.

Use only the supplied source of truth.
Never invent a life event to improve a post.

Choose the real story, lesson, or tension that best supports the user's goal.

CONTENT TYPE RULES

If contentType is "carousel":
- Create a strong first-slide hook.
- Create 5 to 8 slides total.
- Each slide must be concise enough for a visual social carousel.
- Build progression, not disconnected quotes.
- Prefer tension, story, realization, lesson, then closing thought.
- Return the complete slide copy in slides.

If contentType is "motivational_post":
- slides must be an empty array.
- Write a strong standalone hook.
- Build motivation from a real experience or verified lesson.
- Avoid generic inspiration.
- The caption should feel personal, specific, and earned.

If contentType is "reel":
- slides must be an empty array.
- Create a strong spoken-style hook.
- The caption should support a story-driven short-form video.
- Do not pretend a full video script was requested.

EDITORIAL QUALITY RULES

Ban generic motivational clichés and empty self-help language.
Do not use phrases such as:
"It's a journey, not a destination."
"Believe in yourself."
"Never give up."
"Start today."
"Take action now."
"Unlock your potential."
"Become the best version of yourself."

Do not write a generic CTA such as:
"Start applying what you learn today."
"Share your thoughts."
"Comment below."
"Follow for more."
"Keep pushing."

A CTA must emerge naturally from the story.
It may ask a sharp reflective question.
It may leave the reader with a specific challenge.
It may also be intentionally empty if forcing a CTA would weaken the post.

Use concrete verified details from Anthony's source story when they strengthen credibility.
Prefer specific tension over abstract advice.
Prefer confession over preaching.
Prefer earned lessons over motivational slogans.
Prefer uncomfortable truth over polished inspiration.

Do not make Anthony sound superior to the reader.
Do not make Anthony sound fully healed, fully disciplined, or finished.
Preserve uncertainty, struggle, contradiction, and ongoing growth when truthful.

For carousels:
Every slide must advance the narrative.
Do not paraphrase the previous slide.
Do not repeat the hook in slide 1.
Build progression through:
tension,
specific evidence,
self-confrontation,
realization,
lesson,
and a strong closing thought.

Before returning JSON, silently check:
1. Could this post have been written for any random motivational creator?
2. Did I use a real Anthony-specific tension or detail?
3. Does every slide add something new?
4. Did I use a cliché?
5. Did I force a generic CTA?

If the answer reveals generic writing, rewrite before returning.

OUTPUT RULES

Return only valid JSON.
Return exactly these keys:
contentType
hook
slides
caption
cta
sourceTheme

contentType must exactly match the requested content type.
hook must be a non-empty string.
slides must be an array of strings.
caption must be a non-empty string.
cta must be a string.
sourceTheme must briefly identify the real source theme used.

No markdown fences.
No extra keys.
No commentary outside JSON.

SOURCE OF TRUTH:

${ANTHONY_STORY_CONTEXT}
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({
            goal: input.goal,
            contentType: input.contentType,
          }),
        },
      ],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Groq request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error("Groq returned invalid response JSON.");
  }

  const content = extractGeneratedContent(payload);

  let generated: unknown;

  try {
    generated = JSON.parse(content);
  } catch {
    throw new Error("Groq generated invalid structured JSON.");
  }

  return validateGeneratedContent(generated, input.contentType);
}

function validateGeneratedContent(
  generated: unknown,
  requestedContentType: PersonalBrandContentType,
): GeneratedPersonalBrandContent {
  if (typeof generated !== "object" || generated === null) {
    throw new Error("Groq generated an invalid content object.");
  }

  const record = generated as Record<string, unknown>;

  if (record.contentType !== requestedContentType) {
    throw new Error("Groq returned the wrong content type.");
  }

  const hook =
    typeof record.hook === "string" ? record.hook.trim() : "";

  const caption =
    typeof record.caption === "string" ? record.caption.trim() : "";

  const cta =
    typeof record.cta === "string" ? record.cta.trim() : "";

  const sourceTheme =
    typeof record.sourceTheme === "string"
      ? record.sourceTheme.trim()
      : "";

  if (!hook) {
    throw new Error("Groq generated an empty hook.");
  }

  if (!caption) {
    throw new Error("Groq generated an empty caption.");
  }

  if (!sourceTheme) {
    throw new Error("Groq generated an empty source theme.");
  }

  if (!Array.isArray(record.slides)) {
    throw new Error("Groq generated invalid slides.");
  }

  const slides = record.slides.map((slide) => {
    if (typeof slide !== "string" || !slide.trim()) {
      throw new Error("Groq generated an invalid slide.");
    }

    return slide.trim();
  });

  if (
    requestedContentType === "carousel" &&
    (slides.length < 5 || slides.length > 8)
  ) {
    throw new Error("Carousel must contain between 5 and 8 slides.");
  }

  if (
    requestedContentType !== "carousel" &&
    slides.length !== 0
  ) {
    throw new Error(
      "Non-carousel content must not contain slides.",
    );
  }

  return {
    contentType: requestedContentType,
    hook,
    slides,
    caption,
    cta,
    sourceTheme,
  };
}

function extractGeneratedContent(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Groq returned an invalid response payload.");
  }

  const choices = (payload as Record<string, unknown>).choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("Groq response did not contain choices.");
  }

  const firstChoice = choices[0];

  if (typeof firstChoice !== "object" || firstChoice === null) {
    throw new Error("Groq returned an invalid choice.");
  }

  const message = (firstChoice as Record<string, unknown>).message;

  if (typeof message !== "object" || message === null) {
    throw new Error("Groq response did not contain a message.");
  }

  const content = (message as Record<string, unknown>).content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error(
      "Groq response did not contain generated content.",
    );
  }

  return content;
}
/* ============================================================
 * TOM — AI MANAGER (Milestone 7)
 *
 * Tom decides the next content assignment and delegates it.
 * He never writes the final content himself; the Personal Brand
 * Specialist executes assignments through the proven
 * generatePersonalBrandContent path above, which remains the
 * fabrication firewall with the full source of truth.
 * ============================================================ */

export interface TomAssignment {
  assignedAgent: "personal-brand";
  goal: string;
  contentType: PersonalBrandContentType;
  sourceTheme: string;
  rationale: string;
}

/** Compact safe record of recent queue work, for repetition avoidance. */
export interface RecentWorkItem {
  contentType: string;
  theme: string;
}

/*
 * Compact manager context: verified theme labels with one-line
 * descriptors condensed strictly from ANTHONY_STORY_CONTEXT above.
 * No new facts. Tom only needs to pick a direction; the specialist's
 * generation prompt carries the full source of truth and all
 * fabrication bans.
 */
const TOM_MANAGER_CONTEXT = `
VERIFIED THEME CATALOG (sourceTheme must be exactly one of these labels)

1. Knowing frameworks but failing to execute consistently — Anthony could explain SMARTER goals, discipline systems, and pattern interruption, yet rarely executed before real mentorship.
2. Consuming self-development without application — years of videos and frameworks as expensive entertainment.
3. Mentorship and accountability — a video cannot see your blind spots or confront your patterns in real time; MJ Lopez and William Jones could.
4. Family responsibility — a young financial provider; his mother's years of dialysis. Handle with care, never as clickbait.
5. Building discipline — confronting procrastination, doom scrolling, inconsistency, avoidance, and low standards as identity patterns.
6. Business and sales journey — earning in sales while ambitious but directionless.
7. Moving from sales into operations — learning web design, lead generation, outreach, content, and operations at Wolf Forge Digital.
8. Understanding delivery to believe in service value — it is hard to deeply sell a service without knowing how the value is delivered.
9. Poverty and ambition — a lower-income upbringing in Tagum City; treated as the black sheep; earning the program fee he could not afford.
10. Becoming an operator before building an empire — pausing a brand dream to build skills and stability first; focus compounds, distraction dilutes.
11. Ego and recognition — praise activating over-strategizing; compliments belong in the heart, not in the head.
12. Leaving income that conflicted with conscience — casino-operations income that damaged his peace of mind. Never glorify gambling.
13. Ongoing transformation — still becoming, not a finished guru; documenting change while it happens.

MANAGER RULES
Ground every assignment in one catalog theme only.
Do not invent life events, achievements, statistics, or unsupported claims.
Do not portray Anthony as a finished guru.
Never reveal private business ownership details.
Avoid themes that appear in the recent work provided, when a distinct catalog theme is available.
`;

export async function requestTomAssignment(
  recentWork: RecentWorkItem[],
): Promise<TomAssignment> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const model = process.env.GROQ_MODEL?.trim();

  if (!model) {
    throw new Error("GROQ_MODEL is not configured.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 400,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
You are Tom, the AI Manager of Anthony's personal-brand operation.

You decide the single next piece of content work and delegate it to the
personal-brand specialist. You do not write the final content yourself.

Review the recent work the user message provides and choose ONE next
assignment grounded in the verified theme catalog below.

${TOM_MANAGER_CONTEXT}

OUTPUT RULES

Return only valid JSON with exactly these keys:
assignedAgent
goal
contentType
sourceTheme
rationale

assignedAgent must be exactly "personal-brand".
goal must be one specific, concrete content mission grounded in the chosen theme.
contentType must be one of: carousel, motivational_post, reel.
sourceTheme must be exactly one catalog theme label (the text after the number).
rationale must be at most 2 sentences explaining the management decision.

No markdown fences.
No extra keys.
No commentary outside JSON.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({ recentWork }),
        },
      ],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Groq request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error("Groq returned invalid response JSON.");
  }

  const content = extractGeneratedContent(payload);

  let assignment: unknown;

  try {
    assignment = JSON.parse(content);
  } catch {
    throw new Error("Tom produced invalid structured JSON.");
  }

  return validateTomAssignment(assignment);
}

function validateTomAssignment(assignment: unknown): TomAssignment {
  if (typeof assignment !== "object" || assignment === null) {
    throw new Error("Tom produced an invalid assignment object.");
  }

  const record = assignment as Record<string, unknown>;

  if (record.assignedAgent !== "personal-brand") {
    throw new Error(
      'Tom assigned an unsupported agent. Only "personal-brand" is available.',
    );
  }

  const goal = typeof record.goal === "string" ? record.goal.trim() : "";

  if (!goal) {
    throw new Error("Tom produced an empty goal.");
  }

  const contentType = record.contentType;

  if (
    contentType !== "carousel" &&
    contentType !== "motivational_post" &&
    contentType !== "reel"
  ) {
    throw new Error("Tom chose an unsupported content type.");
  }

  const sourceTheme =
    typeof record.sourceTheme === "string" ? record.sourceTheme.trim() : "";

  if (!sourceTheme) {
    throw new Error("Tom produced an empty sourceTheme.");
  }

  const rationale =
    typeof record.rationale === "string" ? record.rationale.trim() : "";

  if (!rationale) {
    throw new Error("Tom produced an empty rationale.");
  }

  return {
    assignedAgent: "personal-brand",
    goal,
    contentType,
    sourceTheme,
    rationale: rationale.slice(0, 500),
  };
}

/* ============================================================
 * TOM — WEEKLY CAMPAIGN PLANNING (Milestone 8A)
 *
 * Tom plans a small campaign of assignments together, as one
 * coherent request, rather than making N independent decisions.
 * Scheduling is deliberately excluded from this contract — it is
 * assigned deterministically in code at the route boundary.
 * ============================================================ */

export interface TomCampaignItem {
  sequence: number;
  assignedAgent: "personal-brand";
  goal: string;
  contentType: PersonalBrandContentType;
  sourceTheme: string;
  rationale: string;
}

const CAMPAIGN_RATIONALE_MAX_LENGTH = 500;
const CAMPAIGN_GOAL_MAX_LENGTH = 400;

/** Normalizes a theme label for duplicate detection (case/whitespace only). */
function normalizeThemeForComparison(theme: string): string {
  return theme.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function requestTomCampaignPlan(
  objective: string,
  count: number,
  recentWork: RecentWorkItem[],
): Promise<TomCampaignItem[]> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const model = process.env.GROQ_MODEL?.trim();

  if (!model) {
    throw new Error("GROQ_MODEL is not configured.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: Math.min(3000, 500 + count * 250),
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
You are Tom, the AI Manager of Anthony's personal-brand operation.

You are planning a small content campaign of exactly ${count} items as ONE
coherent plan, not ${count} unrelated decisions. Choose a useful mix of
content types and distinct themes that together tell a varied, coherent
week of content, grounded only in the verified theme catalog below.

Review the recent work the user message provides and avoid repeating those
themes when a distinct catalog theme is available.

${TOM_MANAGER_CONTEXT}

OUTPUT RULES

Return only valid JSON with exactly this shape:
{ "items": [ { "sequence", "assignedAgent", "goal", "contentType", "sourceTheme", "rationale" }, ... ] }

items must contain exactly ${count} entries.
sequence must be 1 through ${count}, each used exactly once.
assignedAgent must be exactly "personal-brand" for every item.
goal must be one specific, concrete content mission grounded in the chosen theme.
contentType must be one of: carousel, motivational_post, reel.
sourceTheme must be exactly one catalog theme label, and every item must use a
DIFFERENT catalog theme from the others in this plan.
rationale must be at most 2 sentences explaining that item's role in the campaign.

No markdown fences.
No extra keys.
No commentary outside JSON.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({ objective, count, recentWork }),
        },
      ],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Groq request failed (${response.status}): ${rawText.slice(0, 300)}`,
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error("Groq returned invalid response JSON.");
  }

  const content = extractGeneratedContent(payload);

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Tom produced invalid structured JSON for the campaign plan.");
  }

  return validateTomCampaignPlan(parsed, count);
}

function validateTomCampaignPlan(plan: unknown, expectedCount: number): TomCampaignItem[] {
  if (typeof plan !== "object" || plan === null) {
    throw new Error("Tom produced an invalid campaign plan object.");
  }

  const items = (plan as Record<string, unknown>).items;

  if (!Array.isArray(items)) {
    throw new Error("Tom's campaign plan did not contain an items array.");
  }

  if (items.length !== expectedCount) {
    throw new Error(
      `Tom's campaign plan must contain exactly ${expectedCount} items (got ${items.length}).`,
    );
  }

  const validated: TomCampaignItem[] = items.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      throw new Error(`Campaign item ${index + 1} is invalid.`);
    }

    const record = raw as Record<string, unknown>;

    if (record.assignedAgent !== "personal-brand") {
      throw new Error(
        `Campaign item ${index + 1} assigned an unsupported agent. Only "personal-brand" is available.`,
      );
    }

    const sequence = record.sequence;

    if (typeof sequence !== "number" || !Number.isInteger(sequence)) {
      throw new Error(`Campaign item ${index + 1} has an invalid sequence.`);
    }

    const goal = typeof record.goal === "string" ? record.goal.trim() : "";

    if (!goal) {
      throw new Error(`Campaign item ${index + 1} produced an empty goal.`);
    }

    const contentType = record.contentType;

    if (
      contentType !== "carousel" &&
      contentType !== "motivational_post" &&
      contentType !== "reel"
    ) {
      throw new Error(`Campaign item ${index + 1} chose an unsupported content type.`);
    }

    const sourceTheme =
      typeof record.sourceTheme === "string" ? record.sourceTheme.trim() : "";

    if (!sourceTheme) {
      throw new Error(`Campaign item ${index + 1} produced an empty sourceTheme.`);
    }

    const rationale =
      typeof record.rationale === "string" ? record.rationale.trim() : "";

    if (!rationale) {
      throw new Error(`Campaign item ${index + 1} produced an empty rationale.`);
    }

    return {
      sequence,
      assignedAgent: "personal-brand",
      goal: goal.slice(0, CAMPAIGN_GOAL_MAX_LENGTH),
      contentType,
      sourceTheme,
      rationale: rationale.slice(0, CAMPAIGN_RATIONALE_MAX_LENGTH),
    };
  });

  const sequences = validated.map((item) => item.sequence).sort((a, b) => a - b);
  const expectedSequences = Array.from({ length: expectedCount }, (_, i) => i + 1);
  if (JSON.stringify(sequences) !== JSON.stringify(expectedSequences)) {
    throw new Error(
      `Tom's campaign plan must use unique sequences 1..${expectedCount}.`,
    );
  }

  const normalizedThemes = validated.map((item) => normalizeThemeForComparison(item.sourceTheme));
  if (new Set(normalizedThemes).size !== normalizedThemes.length) {
    throw new Error("Tom's campaign plan repeated the same sourceTheme across items.");
  }

  return validated.sort((a, b) => a.sequence - b.sequence);
}
