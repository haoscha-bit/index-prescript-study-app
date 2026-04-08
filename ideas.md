# Prescript Study App — Design Brainstorm

## Context
A study productivity tool themed after Project Moon's "The Index" syndicate. The app assigns tasks (Prescripts) from a user-created pool, enforcing structured study sessions with a focus timer and compliance tracking. The aesthetic must channel the Index's dark, authoritative, fatalistic, and formal identity — white cloaks, golden gorgets, black formal attire, blindfolds, ancient pendulums, ink-on-cloth, pneumatic tubes.

---

<response>
<idea>

## Idea 1: "The Vault" — Industrial Occult Machinery

**Design Movement:** Industrial Gothic meets Ecclesiastical Manuscript — inspired by the underground vault where the Prescripts are woven. Think brass mechanisms, ink splatters, woven cloth textures, and pneumatic tube aesthetics.

**Core Principles:**
1. **Mechanical Authority** — Every UI element feels like part of a larger machine; buttons click like levers, transitions feel like gears turning
2. **Ink & Cloth** — Text appears as if written by the pendulum on woven fabric; backgrounds have subtle linen/parchment textures
3. **Subterranean Depth** — Layered shadows and darkness suggesting underground vaults
4. **Ritualistic Precision** — Every interaction feels deliberate and ceremonial

**Color Philosophy:**
- Primary: Deep charcoal black (#0A0A0C) — the void of the vault
- Secondary: Aged gold/brass (#C4A35A) — the pendulum's metallic gleam
- Accent: Ink blue (#2B4C7E) — the Index's signature blue (from the fleur-de-lis)
- Text: Warm ivory (#E8E0D0) — aged parchment
- Danger/Failure: Muted crimson (#8B2500) — dried blood on cloth

**Layout Paradigm:** Single-column vertical scroll mimicking an unrolling scroll/parchment. Content sections are separated by ornamental brass dividers. The main interaction area is a central "vault door" that opens to reveal Prescripts.

**Signature Elements:**
1. A swinging pendulum animation on the main screen that subtly moves
2. Woven textile texture overlays on cards and panels
3. Brass/gold ornamental borders and mechanical fastener details

**Interaction Philosophy:** Every action feels like operating ancient machinery — deliberate, weighty, irreversible. Receiving a Prescript involves a "stamping" animation. Completing one shows the cloth being woven into a tapestry of compliance.

**Animation:** Slow, deliberate transitions. Pendulum swing easing curves. Ink bleeding effects when text appears. Mechanical click/snap for button interactions. Stamp press animation for Prescript assignment.

**Typography System:**
- Display: "Cinzel" — a Roman-inspired serif for headings, evoking carved stone inscriptions
- Body: "Crimson Text" — an elegant serif for readable body text, evoking manuscript writing
- System Messages: "IBM Plex Mono" — monospaced for the cold, directive system voice

</idea>
<probability>0.07</probability>
</response>

<response>
<idea>

## Idea 2: "The Directive" — Brutalist Command Interface

**Design Movement:** Brutalist Terminal UI meets Korean Noir — inspired by the emotionless, authoritative tone of the Prescripts themselves. Stripped of all ornament, the interface IS the system. No warmth, no comfort — pure directive.

**Core Principles:**
1. **Absolute Authority** — The UI speaks in commands, not suggestions; every element asserts dominance
2. **Stripped Bare** — No decorative elements; every pixel serves the system's purpose
3. **Asymmetric Tension** — Off-center layouts create unease and urgency
4. **Surveillance State** — The system watches; progress bars and counters feel like monitoring

**Color Philosophy:**
- Primary: True black (#000000) — absolute void, no warmth
- Secondary: Cold white (#F0F0F0) — clinical, sterile contrast
- Accent: Electric blue (#3B82F6) — the Index's blue, used sparingly as the only color
- Warning: Amber (#D97706) — deviation alerts
- Failure: Pure red (#DC2626) — stark, unforgiving

**Layout Paradigm:** Asymmetric split-screen. Left panel is a narrow command strip (navigation, status). Right panel is the main workspace. Content is left-aligned with aggressive negative space on the right, creating tension. No center alignment anywhere.

**Signature Elements:**
1. A persistent "compliance meter" bar at the top of every screen — always watching
2. Redacted/classified text styling for locked or future features (black bars over text)
3. Scan-line overlay effect suggesting CRT/surveillance camera footage

**Interaction Philosophy:** Interactions are binary — comply or deviate. No gentle confirmations. Buttons don't have hover states that soften; they invert harshly. Cancelling a session triggers a stark "DEVIATION RECORDED" full-screen flash.

**Animation:** Minimal but impactful. Text appears character-by-character like a teletype. Screen flickers subtly on state changes. Hard cuts instead of smooth transitions. Glitch effects on failure states.

**Typography System:**
- Display: "Space Grotesk" — geometric, cold, authoritative for headings
- Body: "JetBrains Mono" — monospaced throughout for the terminal/command aesthetic
- Directives: All caps, letter-spaced, creating a sense of official documentation

</idea>
<probability>0.05</probability>
</response>

<response>
<idea>

## Idea 3: "The Prescript" — Formal Document Aesthetic

**Design Movement:** Dark Diplomatic Document meets Korean Manhwa Panel Design — inspired by the physical Prescripts themselves as formal documents, combined with the visual storytelling of Project Moon's art. The app feels like you're handling classified Index documents.

**Core Principles:**
1. **Document as Interface** — Every screen is a formal document: sealed, stamped, filed
2. **Hierarchical Formality** — Clear visual hierarchy mimicking military/bureaucratic rank structure
3. **Contained Darkness** — Dark backgrounds with precisely bordered light content areas, like documents on a dark desk
4. **Ceremonial Weight** — Actions carry the gravity of signing official orders

**Color Philosophy:**
- Primary: Near-black navy (#0C0F1A) — the dark formal attire of Index members
- Secondary: Warm gold (#B8963E) — the golden gorgets and badge trim
- Accent: Index blue (#4A7EC7) — the fleur-de-lis blue, used for active/selected states
- Surface: Dark slate (#1A1D2E) — document surface, slightly lighter than background
- Text: Silver-white (#D4D4D8) — clean, high-contrast readability
- Seal/Stamp: Deep wax red (#7C1D1D) — for completion stamps and seals

**Layout Paradigm:** Card-based document layout. Each major element is a "document" — bordered, with a header strip (like a document classification bar), content area, and footer seal. Documents are arranged in a staggered, overlapping layout like papers on a desk. Navigation uses a side tab system like file folder tabs.

**Signature Elements:**
1. A wax seal stamp animation when completing Prescripts — the gold seal of compliance
2. Document classification headers on every card (e.g., "PRESCRIPT // PRIORITY: STANDARD // ISSUED: [date]")
3. A subtle golden thread/line motif connecting elements — referencing the loom threads that weave Prescripts

**Interaction Philosophy:** Receiving a Prescript feels like breaking a seal on a classified document. The timer page is a single focused document with nothing else visible. Completing feels like stamping and filing. The history is a filing cabinet of past documents.

**Animation:** Paper unfold/reveal for new Prescripts. Stamp press with ink spread for completions. Smooth slide transitions between "documents." Golden thread traces connecting navigation elements. Subtle paper texture parallax on scroll.

**Typography System:**
- Display: "Cormorant Garamond" — elegant, authoritative serif for document titles and Prescript text
- Body: "Source Sans 3" — clean, professional sans-serif for interface text
- Classification Headers: "Geist Mono" — monospaced, all-caps for system metadata and classification bars

</idea>
<probability>0.08</probability>
</response>

---

## Selected Approach: Idea 3 — "The Prescript" (Formal Document Aesthetic)

This approach best captures the essence of the Index's Prescript system. The document-as-interface metaphor directly maps to the app's core interaction (receiving and completing Prescripts), while the dark diplomatic aesthetic channels the Index's formal, authoritative identity without being purely brutalist or overly ornamental. The wax seal, classification headers, and filing cabinet metaphors create a cohesive and immersive experience that reinforces the "system-driven" philosophy of the MVP.
