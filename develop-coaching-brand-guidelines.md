# DEVELOP COACHING — CLAUDE CODE BRAND GUIDELINES

These guidelines ensure your Claude Code environment, prompts, and coding UI visually match the Develop Coaching brand identity.

---

## 1. BRAND COLOUR SYSTEM

### Primary Colours

Use these for headers, highlight lines, CLI borders, emphasis text, and section dividers.

**Dark Blue / Navy**
- HEX: `#0A1A2F`
- Usage: Primary background, header bars, code block borders

**Vivid Blue**
- HEX: `#005CFF`
- Usage: Prompts, CTAs, highlight text, active tabs

**Sky Blue / Light Blue**
- HEX: `#62B6FF`
- Usage: Secondary highlight, hover states, side accents

### Secondary / Neutral Colours

**Charcoal Grey**
- HEX: `#4A4A4A`
- Usage: Subheadings, labels

**Soft Grey**
- HEX: `#E4E6EB`
- Usage: Background panels, cards, muted dividers

**White**
- HEX: `#FFFFFF`
- Usage: Body backgrounds, text contrast

---

## 2. TYPOGRAPHY GUIDELINES

### Primary Font

**Source Sans Pro** (as specified in the PDF)
- Use consistently for all text—editor, prompt windows, sidebars, documentation

### Font Rules

**Headings:**
- Source Sans Pro — Semibold / Bold

**Body Text:**
- Source Sans Pro — Regular

**Code Snippets / Commands:**
- Use monospace but keep scale consistent with brand
- Recommended: JetBrains Mono or Fira Code
- Weight: Regular

**Line Height:**
- 1.4–1.5 for clarity inside prompts

---

## 3. PROMPT WRITING STYLE GUIDE (Claude Code)

### Tone

- Clear
- Confident
- Concise
- Supportive (Develop Coaching energy)

### Prompt Structure

Use a 3-part structure to ensure clarity:

1. **Context** – What's happening
2. **Instruction** – What you want Claude to do
3. **Format** – How you want it returned

### Example Template

```
# CONTEXT
We are configuring backend automation for the Develop Coaching diagnostic pipeline.

# INSTRUCTION
Rewrite this code to improve reliability and add structured logging.

# FORMAT
Return code only. Use comments to explain decisions. No prose.
```

### Colour Usage Inside Prompts

- **Blue (#005CFF)** → Key actions, headings
- **Sky Blue (#62B6FF)** → Links or optional text
- **Grey (#4A4A4A)** → Notes or caveats

---

## 4. CLAUDE CODE UI / TERMINAL BRANDING

Use the following design directions for configuring your code environment:

**Terminal Background**
- Dark Navy → `#0A1A2F`

**Primary Text**
- White → `#FFFFFF`

**Accent / Highlight Text**
- Vivid Blue → `#005CFF` (for prompts, paths, active lines)

**Selection Colour**
- Sky Blue → `#62B6FF`

**Warning / Errors**
- Muted Red → `#E35252` (Not part of brand, but recommended for dev clarity)

**Success**
- Brand Blue → `#005CFF`

---

## 5. COMPONENT DESIGN (for internal tools / dashboards)

### Buttons

**Primary Button**
- Background: `#005CFF`
- Text: `#FFFFFF`
- Radius: 6–10px

**Secondary Button**
- Background: `#E4E6EB`
- Text: `#0A1A2F`

---

## 6. SPACING & LAYOUT

- **Margin scale:** 8 / 16 / 24 / 32 px
- **Card padding:** 16–24 px
- **Section spacing:** 48 px
- Keep layouts airy, uncluttered, and coaching-industry clean

---

## 7. LOGO USAGE (For Claude Code Workspace Sidebar)

- Use dark logo on light backgrounds
- Use white logo on navy backgrounds
- Maintain minimum 20px padding around it
- Avoid stretching, rotating, or recoloring

---

## 8. SAMPLE BRAND-CONSISTENT PROMPT

Here's how your prompts should visually feel:

```
# DEVELOP COACHING — A Team Pipeline
Please inspect this backend integration snippet.

Rewrite it using:
- Async functions
- Clean error handling patterns
- Logging that matches our Develop Coaching code style

Return only the code, formatted cleanly.
```

---

**Last Updated:** January 2025
**Maintained By:** Develop Coaching Development Team
