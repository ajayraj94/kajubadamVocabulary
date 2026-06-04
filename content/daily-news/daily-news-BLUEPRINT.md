# 📋 Daily News Article Blueprint — Based on `2026-05-31.md`

> **Source file:** [`content/daily-news/2026-05-31.md`](content/daily-news/2026-05-31.md) (1270 lines)
> **Parser:** [`lib/daily-news.ts`](lib/daily-news.ts)
> **Frontend component:** [`app/daily-news/[slug]/DailyNewsVocabQuizClient.tsx`](app/daily-news/[slug]/DailyNewsVocabQuizClient.tsx)
> **Metadata generator:** [`app/daily-news/[slug]/page.tsx`](app/daily-news/[slug]/page.tsx)
>
> **CRITICAL: Do NOT modify frontend (`app/`) or backend (`lib/`) code. This blueprint is for content creation only.**

---

## 📊 Quality Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total lines | ~1250-1350 | Varies by editorial length; source `2026-05-31.md` is 1270 lines |
| Frontmatter fields | 10 fields | `date`, `title`, `metaDescription`, `keywords`, `author`, `source`, `slug`, `ogTitle`, `ogDescription`, `aeoDefinition` |
| Editorial paragraphs | Variable | Alternating EN→HI pairs, bold vocabulary; count depends on editorial length |
| Sections | 9 (`### 📂`) | Q1-Q45, 5 questions each |
| Question types | 9 distinct | Vocabulary Shifts, Error Detection, Triple Fillers, Fragment Completion, Para Jumbles, Collocations, Reading Comprehension, Voice, Narration |
| Total questions | 45 | 5 per section |
| AEO blockquotes | 3 | Sections 1, 5, 8 only |
| Directions | 9 | ALL 9 sections have `**Directions (...)**` |
| FAQ items | 6 | Q1-Q6, NO AEO/GEO/SEO question |
| Vocabulary table | 15 rows | 4-column markdown table |
| H1 count | Exactly 1 | Editorial title EN — HI |
| H2 count | 5 | 2 editorial subtitles + Practice Set + Vocab + FAQ + Keep Learning |
| H3 count | 17 | 2 editorial sub-sections + 9 section headers + 6 FAQ questions |
| H4 count | 45 | One per question (Q1-Q45) |

---

## 🔐 1. Frontmatter Rules (10 Fields — NO MORE, NO LESS)

```yaml
---
date: "[YYYY-MM-DD]"
title: "[EDITORIAL TITLE IN ENGLISH] — [YEAR] Advanced English Grammar & Vocabulary Masterclass | 45-Question Practice Set for SSC CGL, IBPS PO, SBI PO Mains"
metaDescription: "[YEAR] latest: Master SSC CGL Tier 2 and IBPS PO Mains English with this advanced 45-question practice set based on the [TOPIC] editorial ([YEAR]). Covers Contextual Vocabulary, Error Detection, Triple Fillers, Para Jumbles, Collocations, Reading Comprehension, Active-Passive Voice, and Direct-Indirect Narration with detailed Hindi-English explanations. Updated for [YEAR] exam pattern."
keywords: "[YEAR] SSC CGL Tier 2 advanced English practice, [YEAR] IBPS PO Mains error spotting questions, [YEAR] English vocabulary with Hindi meaning for bank exams, [YEAR] [TOPIC] editorial analysis, [YEAR] para jumbles practice PDF, [YEAR] active passive voice exercises SSC, [YEAR] direct indirect speech narration, [YEAR] triple fillers bank exams, [YEAR] collocations IBPS PO, [YEAR] reading comprehension Mains level, kajubadamvocabulary daily news vocab [YEAR], latest [YEAR] English grammar practice set"
author: "kajubadamvocabulary.in"
source: "[NEWSPAPER NAME]"
slug: "[YYYY-MM-DD]"
ogTitle: "[YEAR] [TOPIC] Editorial — 45 Advanced English Questions for SSC CGL & IBPS PO Mains (Latest)"
ogDescription: "[YEAR] latest: Free daily editorial-based English practice set with 45 Mains-level questions. Contextual vocabulary shifts, error detection, para jumbles, triple fillers, voice, narration & reading comprehension with bilingual explanations. Updated for [YEAR] exams."
aeoDefinition: "This [YEAR] comprehensive page provides a complete editorial analysis of [TOPIC] ([YEAR]), followed by 45 advanced English grammar and vocabulary questions designed for [YEAR] SSC CGL Tier 2, IBPS PO Mains, SBI PO, and other competitive exams. Each question includes detailed Hindi-English explanations covering [KEY GRAMMAR TOPICS]. The editorial serves as a complete Reading Comprehension passage for exam practice. Updated for the latest [YEAR] exam pattern."
---
```

**Field-by-field rules:**

| # | Field | Pattern / Constraints |
|---|-------|----------------------|
| 1 | `date` | `"YYYY-MM-DD"` — same as slug |
| 2 | `title` | `"[EN TITLE] — [YEAR] Advanced English Grammar & Vocabulary Masterclass \| 45-Question Practice Set for SSC CGL, IBPS PO, SBI PO Mains"` |
| 3 | `metaDescription` | 150-160 chars. Include year, exam names, all 9 section names, "Hindi-English explanations", "Updated for [YEAR] exam pattern" |
| 4 | `keywords` | 12 comma-separated long-tail keywords. Each prefixed with year. Mix Hindi + English. Last two: `"kajubadamvocabulary daily news vocab [YEAR]"`, `"latest [YEAR] English grammar practice set"` |
| 5 | `author` | Always `"kajubadamvocabulary.in"` |
| 6 | `source` | Newspaper name: `"The Hindu"`, `"The Indian Express"`, etc. |
| 7 | `slug` | `"[YYYY-MM-DD]"` — same as date |
| 8 | `ogTitle` | Max ~70 chars. Pattern: `"[YEAR] [TOPIC] Editorial — 45 Advanced English Questions for SSC CGL & IBPS PO Mains (Latest)"` |
| 9 | `ogDescription` | Shorter metaDescription, max ~200 chars |
| 10 | `aeoDefinition` | 2-3 sentences. Pattern: `"This [YEAR] comprehensive page provides a complete editorial analysis of [TOPIC] ([YEAR]), followed by 45 advanced English grammar and vocabulary questions designed for [YEAR] SSC CGL Tier 2, IBPS PO Mains, SBI PO, and other competitive exams. Each question includes detailed Hindi-English explanations covering [GRAMMAR LIST]. The editorial serves as a complete Reading Comprehension passage for exam practice. Updated for the latest [YEAR] exam pattern."` |

---

## 📐 2. Heading Hierarchy (MUST NOT BE BROKEN)

| Level | Markdown | Usage | Count |
|-------|----------|-------|-------|
| **H1** | `# ` | Editorial title: English — Hindi on ONE line | Exactly 1 |
| **H2** | `## ` | Editorial subtitles (italic), Practice Set header, Vocabulary header, FAQ header, Keep Learning header | Exactly 5 |
| **H3** | `### ` | Editorial sub-sections (with Hindi), Section headers (`📂`), FAQ questions | 17 |
| **H4** | `#### ` | Individual question headings | 45 |

### H1 Format (line 14 of source):

```
# [EDITORIAL TITLE IN ENGLISH] — [HINDI TRANSLATION]
```

Single line. No line break between English and Hindi — separated by ` — ` (space-em dash-space).

### H2 Formats:

```
## *[EDITORIAL SUBTITLE IN ENGLISH]*           ← line 16, italic
## *[EDITORIAL SUBTITLE IN HINDI]*              ← line 17, italic
## 📝 Advanced English Grammar & Vocabulary Masterclass: 45-Question Practice Set    ← line 117
##  What are the most important vocabulary words from this editorial?               ← line 1175, TWO spaces after ##, NO emoji
## ❓ Frequently Asked Questions (FAQ)                                              ← line 1198
## 🎓 Keep Learning with kajubadamvocabulary.in                                     ← line 1269
```

**⚠️ CRITICAL:** The vocabulary header has `##  ` (two spaces) after the hashes — NO emoji like 📚. This is the actual format at line 1175.

### H3 Formats:

```
### STATE OF PLAY                              ← Editorial sub-section (English)
### खेल की स्थिति                                ← Hindi translation on next line
### Alternative Projects                       ← Editorial sub-section (English)
### वैकल्पिक परियोजनाएं                          ← Hindi translation on next line
### 📂 Section N: [Section Name] (QX-QY)        ← Section header
### Q1. [Question text]                        ← FAQ question
```

### H4 Format:

```
#### Q[N]. [Question Type] — [Short Description]
```

Examples from source:
- `#### Q1. Contextual Vocabulary — "Track"`
- `#### Q6. Spotting the Error — Parallelism & Relative Pronouns`
- `#### Q11. Triple Filler — Versatile Vocabulary`
- `#### Q16. Fragment Completion — Subjunctive Mood`
- `#### Q21. Para Jumble — Infrastructure Policy`
- `#### Q26. Collocation — Verb + Noun`
- `#### Q31. Reading Comprehension — Tone Analysis`
- `#### Q36. Voice Transformation — Complex Sentence`
- `#### Q41. Narration — Assertive Sentence with Time Change`

---

## 📰 3. Editorial Body Format

```
# [EDITORIAL TITLE EN] — [HINDI TRANSLATION]             ← H1, single line

## *[EDITORIAL SUBTITLE EN]*                               ← H2, italic
## *[EDITORIAL SUBTITLE HI]*                               ← H2, italic

**S. Anandan**                                             ← Bold author byline (EN)
**एस. आनंदन**                                              ← Bold author byline (HI)

### STATE OF PLAY                                           ← H3 sub-section (EN)
### खेल की स्थिति                                            ← H3 sub-section (HI)

[English paragraph 1 — bold vocabulary words]              ← EN body
[Hindi paragraph 1 — matching bold vocabulary words]       ← HI body

[English paragraph 2 — bold vocabulary words]
[Hindi paragraph 2 — matching bold vocabulary words]

... (continue EN→HI pairs) ...

### Alternative Projects                                   ← H3 sub-section (EN)
### वैकल्पिक परियोजनाएं                                      ← H3 sub-section (HI)

[English paragraph N — bold vocabulary words]
[Hindi paragraph N — matching bold vocabulary words]

---

## 📝 Advanced English Grammar & Vocabulary Masterclass: 45-Question Practice Set    ← H2
*Published by the Academic Editorial Team at [kajubadamvocabulary.in](https://kajubadamvocabulary.in)*

Welcome to the ultimate preparation guide... (INTRO paragraph)

---

[Section 1 starts...]
```

**Rules:**
- Every English paragraph MUST be immediately followed by its Hindi translation
- Bold vocabulary words match between EN and HI paragraphs
- Editorial sub-sections use H3 with Hindi translation on the next line
- Author byline is **bold text** (not a heading), EN then HI on separate lines

---

## 📂 4. Section Structure Overview

| Section | Name | Questions | AEO Blockquote | Source Line on Q? | Directions? |
|---------|------|-----------|---------------|-------------------|-------------|
| 1 | Context-Based Vocabulary Shifts | Q1-Q5 | ✅ YES | Q1 only | ✅ |
| 2 | Advanced Error Detection | Q6-Q10 | ❌ NO | Q6 only | ✅ |
| 3 | Triple-Sentence Fillers | Q11-Q15 | ❌ NO | Q11 only | ✅ |
| 4 | Fragment Completion | Q16-Q20 | ❌ NO | ❌ NONE | ✅ |
| 5 | Advanced Para Jumbles | Q21-Q25 | ✅ YES | Q21 only | ✅ |
| 6 | Collocations | Q26-Q30 | ❌ NO | Q26 only | ✅ |
| 7 | Reading Comprehension | Q31-Q35 | ❌ NO | ❌ NONE | ✅ |
| 8 | Active & Passive Voice | Q36-Q40 | ✅ YES | ❌ NONE | ✅ |
| 9 | Direct & Indirect Speech | Q41-Q45 | ❌ NO | ❌ NONE | ✅ |

### Section Template (General):

```
### 📂 Section N: [Section Name] (QX-QY)

> [AEO blockquote — ONLY for Sections 1, 5, 8. Plain `>` with NO label prefix like "AEO Definition:" or "AEO:"]

**Directions (QX-QY):** [Direction text — EVERY section MUST have this]

---

#### Q[N]. [Question Type] — [Description]
*Section: [Section Name] — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← ONLY on Q1/Q6/Q11/Q21/Q26

[Question body...]

**Options:**
(A) [A] 
(B) [B] 
(C) [C] 
(D) [D] 
(E) [E]



**Correct - [LETTER]**
**Reasoning:**
[Explanation...]


---
```

### Section-Specific Direction Texts:

| Section | Direction Text |
|---------|---------------|
| **S1** | `**Directions (Q1-Q5):** Choose the sub-sentence(s) where the bold word has a DIFFERENT meaning from how it is used in the Principal Sentence (PS).` |
| **S2** | `**Directions (Q6-Q10):** Each question below contains a sentence divided into three parts — (I), (II), and (III). Identify the part(s) that contain a grammatical error. If the sentence is error-free, mark "No error" as your answer.` |
| **S3** | `**Directions (Q11-Q15):** Each question below has three separate sentences, each with a blank. Choose the SINGLE word from the options that fits meaningfully and grammatically in ALL three sentences.` |
| **S4** | `**Directions (Q16-Q20):** Each question below contains a root sentence with a blank, followed by three sentence fragments (I, II, III). Choose the option that identifies which fragment(s) grammatically and contextually complete the given sentence.` |
| **S5** | `**Directions (Q21-Q25):** Each question below contains six sentences (A, B, C, D, E, F). Rearrange them to form a coherent paragraph. Choose the option that represents the CORRECT logical sequence.` |
| **S6** | `**Directions (Q26-Q30):** Each question below contains a sentence with a blank. From the given options, choose the word that forms the most idiomatic and contextually appropriate collocation to complete the sentence.` |
| **S7** | `**Directions (Q31-Q35):** Read the editorial passage provided at the beginning of this article carefully and answer the questions that follow. Each question tests a different comprehension skill — tone, inference, theme, detail, and vocabulary-in-context.` |
| **S8** | `**Directions (Q36-Q40):** A sentence has been given in Active/Passive Voice. Out of the five alternatives suggested, select the one which best expresses the same sentence in Passive/Active Voice.` |
| **S9** | `**Directions (Q41-Q45):** Each question below presents a sentence in Direct Speech. From the given alternatives, select the option that MOST ACCURATELY expresses the same sentence in Indirect Speech, following the rules of narration.` |

---

## 🎯 5. Question Metadata Rules

### Line 1 (REQUIRED on ALL 45 questions):
```
*Section: [Section Name] — IBPS PO / SSC CGL Mains Level*
```

### Line 2 (OPTIONAL — ONLY on specific questions):
```
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*
```

**Source line placement — ONLY these questions have it:**
- **Section 1**: Q1 only
- **Section 2**: Q6 only
- **Section 3**: Q11 only
- **Section 4**: NONE
- **Section 5**: Q21 only
- **Section 6**: Q26 only
- **Section 7**: NONE
- **Section 8**: NONE
- **Section 9**: NONE

**⚠️ Sections 4, 7, 8, 9 have NO source line on ANY question.**

---

## 🔤 6. Answer Format Rules

### Standard Answer (Sections 1-4, 6-9):

```
**Correct - [LETTER]**
**Reasoning:**
[Detailed Hindi-English explanation...]
```

- `**Correct - [LETTER]**` — space before AND after the hyphen. Letter is uppercase (A-E).
- `**Reasoning:**` — exact spelling, colon inside the bold.
- Explanation paragraph follows on the next line(s).
- One blank line before `**Correct` and one blank line after the reasoning.

### Section 5 Special Answer Format:

```
**Correct - [LETTER]**
**Sequence:** [X] → [Y] → [Z] → [A] → [B] → [C]
**Reasoning:**
[Step-by-step explanation of each transition...]
```

- `**Sequence:**` line goes BETWEEN Correct and Reasoning
- Format: Letter → Letter → Letter → Letter → Letter → Letter (arrow separator with spaces)

---

## 🧩 7. Section 5 — Para Jumbles Special Rules

### Unique Requirements:
1. **5 different topics** — each Q21-Q25 must have a UNIQUE topic (not all from the same editorial)
2. **6 unique sentences A-F per question** — no sentence reuse across questions
3. **Question header** uses `**Sentences:**` (not `**Question:**`)
4. **Options header** uses `**Options (Correct Sequence):**` (not just `**Options:**`)
5. **Option format**: Letter sequences like `(A) C - D - E - B - A - F`
6. **Question metadata**: `*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*`

### Q21-Q25 Template (per question):

```
#### Q2X. Para Jumble — [UNIQUE TOPIC NAME]

*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← Q21 ONLY

**Sentences:**
*   **(A)** [Sentence A]
*   **(B)** [Sentence B]
*   **(C)** [Sentence C]
*   **(D)** [Sentence D]
*   **(E)** [Sentence E]
*   **(F)** [Sentence F]

**Options (Correct Sequence):**
(A) [6-part sequence]
(B) [6-part sequence]
(C) [6-part sequence]
(D) [6-part sequence]
(E) [6-part sequence]



**Correct - [LETTER]**
**Sequence:** [X] → [Y] → [Z] → [A] → [B] → [C]
**Reasoning:**
[Step-by-step logical flow explanation...]


---
```

---

## ❓ 8. FAQ Section Rules

### Structure:
```
## ❓ Frequently Asked Questions (FAQ)            ← H2

### Q1. [Specific question about the editorial topic]
**Answer:** [Paragraph with bold numbering for key points...]

### Q2. Which competitive exams is this practice set useful for?
**Answer:** [STANDARD TEXT — see below]

### Q3. How to use this editorial for Reading Comprehension practice?
**Answer:** [STANDARD TEXT — see below]

### Q4. What is the best strategy to solve [HARDEST SECTION] in bank exams?
**Answer:** [5-step strategy...]

### Q5. Can I download this practice set as a PDF?
**Answer:** [STANDARD TEXT — see below]

### Q6. How to improve [SKILL] for [EXAM]?
**Answer:** [5-step approach...]
```

### Standard FAQ Answers (MUST match exactly):

**Q2 — Standard Exam List:**
```
**Answer:** This 45-question practice set is specifically designed for **Mains-level** competitive exams including:
- **SSC CGL Tier 2** (Staff Selection Commission — Combined Graduate Level)
- **IBPS PO Mains** (Institute of Banking Personnel Selection — Probationary Officer)
- **SBI PO Mains** (State Bank of India — Probationary Officer)
- **CDS** (Combined Defence Services)
- **UPSC CAPF** (Central Armed Police Forces)
- Any banking or government exam testing advanced English grammar, vocabulary, and reading comprehension.

The difficulty level is **Super Mock / Mains level**, meaning it targets the most challenging questions that appear in the final stage of these exams.
```

**Q3 — Standard RC Approach:**
```
**Answer:** Follow this 3-step approach for maximum benefit:

**Step 1 — Read the Editorial First:** Read the English editorial (top section) carefully without looking at the Hindi translation. Try to understand the central thesis, author's tone, and key arguments. This builds reading speed and comprehension.

**Step 2 — Attempt Q31-Q35 (Reading Comprehension Section):** These 5 questions test [SKILL 1], [SKILL 2], [SKILL 3], [SKILL 4], and [SKILL 5] — exactly the question types asked in IBPS PO and SSC CGL Mains.

**Step 3 — Cross-check with Hindi Translation:** Use the Hindi translation to verify your understanding of complex sentences and vocabulary. The bilingual format ensures you grasp both the literal meaning and contextual nuance of each word.

**Pro Tip:** The bold words in the editorial are the high-frequency vocabulary words tested in the Synonyms, Antonyms, and Contextual Vocabulary sections.
```

**Q5 — Standard PDF Answer:**
```
**Answer:** Currently, this practice set is available as an interactive web page on **[kajubadamvocabulary.in](https://kajubadamvocabulary.in)**. The interactive format allows you to:
- Attempt each question and get instant feedback (correct/incorrect)
- View detailed Hindi-English explanations after each answer
- Track your progress across all 9 sections

For offline practice, you can use your browser's **Print → Save as PDF** feature (Ctrl+P / Cmd+P) to generate a PDF version. We recommend attempting the questions online first to benefit from the interactive feedback, then using the PDF for revision.
```

### FAQ Rules Summary:
- **NO AEO/GEO/SEO question** (removed from final version)
- Exactly **6 FAQ items** (Q1 through Q6)
- Q1, Q4, Q6 are topic-specific (vary per article)
- Q2, Q3, Q5 have **standard text** (copy-paste exactly as shown above)
- FAQ headers use `### QN.` format (not `### QN:` or `### QN -`)
- Each answer starts with `**Answer:**`

---

## 📚 9. Vocabulary Table Rules

### Exact Format (from source line 1175):

```
##  What are the most important vocabulary words from this editorial?     ← TWO spaces after ##, NO emoji

**Answer:** Here are the **top 15 exam-relevant vocabulary words** from the [TOPIC] editorial with Hindi meanings:

| # | English Word | Hindi Meaning | Context in Editorial |
|---|-------------|---------------|---------------------|
| 1 | **[WORD 1]** | [HINDI MEANING] | [CONTEXT] |
| 2 | **[WORD 2]** | [HINDI] | [CONTEXT] |
| 3 | **[WORD 3]** | [HINDI] | [CONTEXT] |
| 4 | **[WORD 4]** | [HINDI] | [CONTEXT] |
| 5 | **[WORD 5]** | [HINDI] | [CONTEXT] |
| 6 | **[WORD 6]** | [HINDI] | [CONTEXT] |
| 7 | **[WORD 7]** | [HINDI] | [CONTEXT] |
| 8 | **[WORD 8]** | [HINDI] | [CONTEXT] |
| 9 | **[WORD 9]** | [HINDI] | [CONTEXT] |
| 10 | **[WORD 10]** | [HINDI] | [CONTEXT] |
| 11 | **[WORD 11]** | [HINDI] | [CONTEXT] |
| 12 | **[WORD 12]** | [HINDI] | [CONTEXT] |
| 13 | **[WORD 13]** | [HINDI] | [CONTEXT] |
| 14 | **[WORD 14]** | [HINDI] | [CONTEXT] |
| 15 | **[WORD 15]** | [HINDI] | [CONTEXT] |
```

### Rules:
- **H2 header**: `##  ` (two spaces) followed by `What are the most important vocabulary words from this editorial?` — NO emoji
- **Answer line**: `**Answer:** Here are the **top 15 exam-relevant vocabulary words** from the [TOPIC] editorial with Hindi meanings:`
- **Table**: Exactly 4 columns (`#`, `English Word`, `Hindi Meaning`, `Context in Editorial`), exactly 15 data rows
- English words are **bold** in the table
- Hindi meanings are descriptive (not just one word)
- Context column explains how the word is used in the editorial
- One blank line after the table before the FAQ section

---

## 🎓 10. Keep Learning Footer

### Exact Format (from source line 1269):

```
## 🎓 Keep Learning with kajubadamvocabulary.in
Clear, conceptual English preparation is key to cracking Mains-level examinations. For more advanced practice sets, grammar concept cards, and targeted vocabulary lists, bookmark **[kajubadamvocabulary.in](https://kajubadamvocabulary.in)** as your daily study companion. Have a question about these explanations? Leave us a comment!
```

- **H2 header** with 🎓 emoji
- Single paragraph of text
- Link to `https://kajubadamvocabulary.in` is **bold**
- File ends with this line + newline

---

## 📋 11. AEO Blockquote Rules

Only **3 sections** have AEO blockquotes:

| Section | AEO Blockquote Text (from source) |
|---------|----------------------------------|
| **S1** (line 126) | `> Polysemy refers to a word having multiple related meanings. Competitive exams like SBI PO Mains test if you can identify when a word shifts its part of speech or contextual domain (e.g., *track* as a noun vs. *track* as a verb).` |
| **S5** (line 621) | `> Mains-level para jumbles are cracked not by translating sentences, but by identifying semantic linkages—pronouns linking back to nouns, and transitional words like *Instead, This is because, Consequently*.` |
| **S8** (line 976) | `> High-level voice transformation questions often involve double objects, complex relative clauses, and modal verbs, requiring precision in retaining the original meaning without grammatical distortion.` |

### Rules:
- Use plain `>` — NO label prefix (no "**AEO Definition**", no "AEO:", no "**AEO:**")
- 1-2 sentences of strategy/tip content
- Goes AFTER the `### 📂 Section N:` header, BEFORE the `**Directions (...)**` line
- Sections 2, 3, 4, 6, 7, 9 have NO blockquote at all

---

## 📏 12. Question Body Format by Section Type

### Section 1 — Contextual Vocabulary:

```
#### Q[N]. Contextual Vocabulary — "[WORD]"

*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← Q1 ONLY

**Question:** *(Target: Find the sentence where the bold word has a DIFFERENT meaning)*
**Principal Sentence:** [SENTENCE — bold word is **bold**]
**Sub-Sentences:**
**I.** [SENTENCE — word is **bold**]
**II.** [SENTENCE — word is **bold**]
**III.** [SENTENCE — word is **bold**]

**Options:**
(A) Only I 
(B) Both I and II 
(C) Both II and III 
(D) Only II 
(E) All I, II, and III
```

### Section 2 — Error Detection:

```
#### Q[N]. Spotting the Error — [Error Type]

*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← Q6 ONLY

**Question:**
[SENTENCE with parts marked (I), (II), (III)]

**Options:**
(A) Only (I) 
(B) Only (II) 
(C) Both (I) and (III) 
(D) Both (II) and (III) 
(E) None of (I), (II) & (III)
```

### Section 3 — Triple Fillers:

```
#### Q[N]. Triple Filler — [Subtype]

*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← Q11 ONLY

**Question:**
**I.** [SENTENCE WITH BLANK — Domain 1]
**II.** [SENTENCE WITH BLANK — Domain 2]
**III.** [SENTENCE WITH BLANK — Domain 3]

**Options:**
(A) [Word A] 
(B) [Word B] 
(C) [Word C] 
(D) [Word D] 
(E) [Word E]
```

### Section 4 — Fragment Completion:

```
#### Q[N]. Fragment Completion — [Grammar Topic]

*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*
← NO source line, ever

**Question:**
**Root Sentence:** [SENTENCE WITH ________ BLANK]
**Fragments:**
**I.** [FRAGMENT 1]
**II.** [FRAGMENT 2]
**III.** [FRAGMENT 3]

**Options:**
(A) Only I 
(B) Only II 
(C) Both I and II 
(D) Both II and III 
(E) All I, II, and III
```

### Section 5 — Para Jumbles:
*(See Section 7 above for full template)*

### Section 6 — Collocations:

```
#### Q[N]. Collocation — [Collocation Type]

*Section: Collocations — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*    ← Q26 ONLY

**Question:**
[SENTENCE WITH ________ BLANK — sentence must relate to the editorial's topic/theme]

**Options:**
(A) [A]
(B) [B]
(C) [C]
(D) [D]
(E) [E]

**🔴 CRITICAL: The CORRECT ANSWER for each Q26-Q30 MUST be a hard vocabulary word extracted from the CURRENT editorial's body.**
- Scan the editorial for bold/hard words
- Identify which ones form standard collocations (Verb+Noun, Adverb+Verb, Adjective+Noun, Noun+Preposition)
- Map 5 different editorial words to the 5 collocation types
- NEVER reuse collocation words (fillip, brazenly, irreversible, precursor, viable, etc.) from previous articles
```

### Section 7 — Reading Comprehension:

```
#### Q[N]. Reading Comprehension — [Skill Type]

*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*
← NO source line, ever

**Question:**
[QUESTION ABOUT THE EDITORIAL]

**Options:**
(A) [A] 
(B) [B] 
(C) [C] 
(D) [D] 
(E) [E]
```

### Section 8 — Voice:

```
#### Q[N]. Voice Transformation — [Type]

*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*
← NO source line, ever

**Question:**
[ACTIVE OR PASSIVE SENTENCE]

**Options:**
(A) [TRANSFORMED A] 
(B) [TRANSFORMED B] 
(C) [TRANSFORMED C] 
(D) [TRANSFORMED D] 
(E) [TRANSFORMED E]
```

### Section 9 — Narration:

```
#### Q[N]. Narration — [Type]

*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*
← NO source line, ever

**Question:**
[DIRECT SPEECH SENTENCE — "Quoted," said X.]

**Options:**
(A) [INDIRECT A] 
(B) [INDIRECT B] 
(C) [INDIRECT C] 
(D) [INDIRECT D] 
(E) [INDIRECT E]
```

---

---

## 🎯 13. Question Quality Standards — "Super Mock / Mains Level" Definition

> **Goal:** Every question must feel like it belongs in IBPS PO Mains or SSC CGL Tier 2 — the hardest tier.
> A student should feel challenged, not cheated. Wrong options must be PLAUSIBLE, not random.

### 🔑 Universal Quality Rules (ALL 9 Sections):

1. **Plausible Distractors Rule:** Every wrong option (A-E) must be grammatically correct and semantically plausible. A student who doesn't know the exact rule should find at least 2 options tempting.
   ❌ BAD: Obviously wrong options that anyone can eliminate.
   ✅ GOOD: Options that test borderline cases and subtle distinctions.

2. **One Concept Per Question:** Each question tests EXACTLY ONE primary grammar/vocabulary concept.
   ❌ BAD: A question mixing subjunctive mood + parallelism + preposition errors.
   ✅ GOOD: Q7 tests ONLY subjunctive mood ("recommended that" → base verb).

3. **Trick ≠ Trap:** The question should reward knowledge, not trick through ambiguity.
   ❌ BAD: "Both A and B are correct depending on interpretation."
   ✅ GOOD: Only ONE option is objectively correct; reasoning is unambiguous.

4. **Formal Register:** All sentences use formal academic English (newspaper editorial level). No casual/slang constructions. Vocabulary choices reflect The Hindu / Indian Express style.

5. **Editorial Connection:** Questions Q1-Q35 must reference the editorial topic or vocabulary. Q36-Q45 (Voice & Narration) may use general sentences but must maintain formal tone.

---

### 📂 Section 1 — Contextual Vocabulary Shifts (Q1-Q5):
**Difficulty Driver:** POLYSEMY — one word, 3-4 different meanings across different domains.

| Quality Rule | Description |
|-------------|-------------|
| **Word Selection** | Pick words with 3+ distinct meanings (literal, metaphorical, technical, idiomatic). Source: Q1 "track" (course of action / follow / flow of thought / railway path), Q2 "gross" (extremely / total / disgusting / glaring), Q3 "derail" (literal train vs metaphorical obstruction), Q4 "leeway" (nautical drift vs freedom of action), Q5 "backlash" (mechanical recoil vs social opposition) |
| **Principal Sentence** | MUST use the word in the editorial's context — anchors the question to the article |
| **Sub-Sentence Variety** | 3 sub-sentences must cover: (a) same meaning as PS, (b) different domain/register, (c) different part of speech if possible |
| **Distractor Pattern** | Options test COMBINATIONS (Only I, Both I&II, Both I&III, etc.). Student must identify WHICH sub-sentences shift meaning — harder than single-choice |
| **Answer Distribution** | Across Q1-Q5, the correct answer letter should vary (A, B, C, D, E) — don't repeat same letter twice in a row if avoidable. Source: C, B, A, A, B |
| **Trick Level** | HIGH — all sub-sentences are grammatically flawless. Only semantic analysis reveals the answer. |

**Quality Checklist for Section 1:**
- [ ] Word has at least 3 distinct dictionary meanings?
- [ ] Principal Sentence uses the word from the editorial?
- [ ] At least one sub-sentence uses a LITERAL meaning (if PS is metaphorical) or vice versa?
- [ ] At least one sub-sentence shifts Part of Speech (noun→verb, adjective→adverb)?
- [ ] Wrong options include plausible but wrong combinations?

---

### 📂 Section 2 — Advanced Error Detection (Q6-Q10):
**Difficulty Driver:** SUBTLE grammatical errors masked by complex sentence structure.

| Quality Rule | Description |
|-------------|-------------|
| **Sentence Length** | Each sentence = 35-55 words, spanning 3 parts. Long sentences hide errors. |
| **Error Concealment** | Intervening phrases/clauses between subject and verb (Q6: "which envisaged..." masks "have been" error). Dangling modifiers where the logical subject is buried (Q10). |
| **Grammar Concepts** | Q6: Subject-Verb Agreement, Q7: Subjunctive Mood + Parallelism, Q8: Pronoun-Antecedent Agreement, Q9: Prepositional Collocations, Q10: Dangling Modifiers. Each question = ONE primary concept. |
| **Error Count Per Question** | 1-2 errors max. Never all 3 parts wrong (confusing). Source: Q6=1 error, Q7=2 errors, Q8=1 error, Q9=1 error, Q10=2 errors. |
| **"No Error" Option** | Include "None of (I), (II) & (III)" or "All (I), (II), & (III)" as option E — keeps student honest. Source: Q6 has "None", Q7 has "All". |
| **Distractor Pattern** | Wrong options list error in a part that is ACTUALLY correct. Student must identify both: which part is wrong AND which parts are right. |

**Quality Checklist for Section 2:**
- [ ] Each question tests a DIFFERENT grammar concept (no repetition across Q6-Q10)?
- [ ] Intervening structures mask the error location?
- [ ] At least one question has "None of" or "All of" as an option?
- [ ] Error count varies (1, 2, 1, 1, 2) — not uniform?

---

### 📂 Section 3 — Triple-Sentence Fillers (Q11-Q15):
**Difficulty Driver:** One word fitting 3 UNRELATED domains — vocabulary depth + contextual flexibility.

| Quality Rule | Description |
|-------------|-------------|
| **3-Domain Variety** | Each question's 3 sentences must be from 3 DIFFERENT domains. Source Q11: Finance (market rally) + Science (chemical reaction) + Economics (consumer confidence). Q12: Corporate Governance + Cybersecurity + Legal/Arbitration. Q13: Trade/Economics + Physics/Ballistics + Psychology. Q14: Law/Constitution + Pharma/Regulatory + International Relations. Q15: Environmental Science + Economics + Aerospace Engineering. |
| **Word Selection** | Target contronyms (sanction = approve AND penalize), versatile words with 3+ contextual meanings (compromise, recoil, buffer, precipitate). |
| **Near-Synonym Trap** | 5 options where 2-3 work in ONE or TWO sentences but fail in the third. This is the CORE trick. Source Q11: "Galvanize" works for rally but not chemical reaction. Q12: "Jeopardize" works for I&II but not III (agreement). |
| **Register Consistency** | All 3 sentences maintain formal academic register. No casual sentences. |
| **Grammatical Fit** | The word must fit GRAMMATICALLY (verb/noun form) in all 3 blanks, not just semantically. |

**Quality Checklist for Section 3:**
- [ ] All 5 questions use 3 DIFFERENT domains each?
- [ ] At least one question uses a CONTONYM (word with opposite meanings)?
- [ ] 2-3 wrong options per question work in at least ONE sentence?
- [ ] No domain repeats across Q11-Q15 (e.g., don't use "Finance" in 3 questions)?

---

### 📂 Section 4 — Fragment Completion (Q16-Q20):
**Difficulty Driver:** Fragments that SOUND correct but violate one specific advanced grammar rule.

| Quality Rule | Description |
|-------------|-------------|
| **Grammar Concepts** | Q16: Subjunctive Mood, Q17: Adverbial Inversion, Q18: Correlative Conjunctions, Q19: Conditional Inversion (Type 3), Q20: Parallelism & Infinitives. Each question = ONE concept. |
| **Sound-Right Trap** | Q16: Fragment II "scraps" sounds like normal present tense — student thinks it's correct. Q17: Fragment II "the public realized" sounds natural — student misses inversion rule. Q18: Fragment I "but rather at" sounds logical — student misses "not so much...as" correlative. Q19: Fragment III "would not face" sounds like possible conditional — student misses Type 3 requirement. |
| **Root Sentence Design** | Root ends at the exact point where the grammar rule activates. Q16 ends at "government ________" (subjunctive trigger). Q17 starts with "Not until..." (inversion trigger). Q19 starts with "Had the State government..." (conditional inversion trigger). |
| **Fragment Count** | Always 3 fragments (I, II, III). One is correct, two are wrong. |
| **Option Pattern** | Options test fragments individually AND in combination. "Only I", "Only II", "Both I and II", etc. |

**Quality Checklist for Section 4:**
- [ ] Each question tests a DIFFERENT advanced grammar rule?
- [ ] At least one fragment per question is the "common mistake" version?
- [ ] Root sentence is cut at the exact grammar trigger point?
- [ ] "None of these" or "All I, II, and III" appears as an option in at least one question?

---

### 📂 Section 5 — Advanced Para Jumbles (Q21-Q25):
**Difficulty Driver:** 6 sentences, 5 wrong sequences, transitional markers as the ONLY clues.

| Quality Rule | Description |
|-------------|-------------|
| **5 Unique Topics** | Q21-Q25 must cover 5 COMPLETELY DIFFERENT topics. Source: Infrastructure Policy, Digital Education Revolution, Climate Finance & Developing Nations, RBI's Monetary Policy Dilemma, Antibiotic Resistance Crisis. NOT all from the editorial. |
| **Transitional Markers** | Each sentence pair must have a clear transitional logic: Cause-Effect (This is because..., Consequently...), Contrast (However..., On one hand...On the other hand...), Addition (Furthermore..., Adding to the complexity...), Exemplification (For instance...), Conclusion (Therefore..., Such an approach...). |
| **Pronoun Chain** | Each sentence with a pronoun (This, These, Such, They, It) MUST refer to a noun in the IMMEDIATELY preceding sentence. Test each sequence by checking pronoun references. |
| **5 Wrong Sequences** | Each wrong option (B-E) must be NEARLY logical — wrong by exactly ONE misplaced sentence pair. Don't create obviously absurd sequences. |
| **Sentence Length** | Each sentence 15-30 words. Long enough to carry meaning, short enough to compare. |
| **No Standalone Clues** | Avoid chronological dates, alphabetical hints, or numbered lists that give away the sequence. Only transitional logic should determine order. |

**Quality Checklist for Section 5:**
- [ ] All 5 topics are from DIFFERENT domains (no overlap)?
- [ ] Each of the 6 sentences has a clear transitional marker or pronoun link?
- [ ] Wrong sequences (B-E) are all plausible — differ by only 1-2 sentence positions?
- [ ] No topic repeats the editorial's own topic (Q21 can, but Q22-Q25 must be different)?

---

### 📂 Section 6 — Collocations (Q26-Q30):
**Difficulty Driver:** Near-synonyms where only ONE forms the standard idiomatic collocation — with the CORRECT answer word sourced directly from the current editorial's vocabulary.

| Quality Rule | Description |
|-------------|-------------|
| **🔴 CRITICAL: Vocabulary Source** | **Every collocation question's CORRECT ANSWER word MUST be a hard vocabulary word from the CURRENT editorial.** Do NOT reuse collocation words from other editorials (e.g., `fillip`, `brazenly`, `irreversible`, `precursor`, `viable` were from the Silverline editorial — they must NOT appear in any other editorial's Q26-Q30 unless that editorial also contains those words). Scan the editorial body for bold/hard words and identify which ones form standard collocations with specific verbs, adverbs, adjectives, or prepositions. Build each Q26-Q30 around ONE such editorial word as the correct answer. |
| **Collocation Types** | Q26: Verb+Noun, Q27: Adverb+Verb, Q28: Adjective+Noun, Q29: Noun+Preposition, Q30: Adjective+Noun. One of each type — NO repeat. The 5 correct answers must come from 5 DIFFERENT bold vocabulary words in the editorial. |
| **Near-Synonym Trap** | All 5 options must be SEMANTICALLY similar but only ONE is idiomatic. The 4 wrong options should be plausible near-synonyms that a student might guess. Example (from Silverline): push/fillip/lift/hike/thrust — all mean "boost" but only "fillip" collocates with "give a ___ to". |
| **Formal Register** | Collocations must be formal/academic. Match the tone of The Hindu / Indian Express editorials. |
| **No Overlap** | Each question's correct answer word must NOT appear as a distractor in another question. Each correct answer must be a UNIQUE word from the editorial. |
| **Sentence Context** | The blank sentence in each question should relate to the editorial's TOPIC/THEME, making the question feel integrated with the article rather than generic. |

**How to extract collocations from an editorial (Step-by-step):**
1. Scan ALL bold vocabulary words in the editorial body.
2. For each bold word, check: Does it form a standard collocation? (e.g., if editorial contains "**envisaged**", check: "envisaged a ___" → can form Verb+Noun collocation)
3. Map each qualifying word to one of the 5 collocation types:
   - **Verb+Noun (Q26):** Bold VERB + its noun object (e.g., "**mooted** a proposal", "**trigger** a backlash")
   - **Adverb+Verb (Q27):** Bold ADVERB + its verb (e.g., "**seamlessly** linked", "**significantly** increase")
   - **Adjective+Noun (Q28):** Bold ADJECTIVE + its noun (e.g., "**comprehensive** study", "**ambitious** plan")
   - **Noun+Preposition (Q29):** Bold NOUN + its fixed preposition (e.g., "**collaboration** with", "**apprehensions** about")
   - **Adjective+Noun (Q30):** Different bold ADJECTIVE + noun pair from Q28 (e.g., "**hazardous** cargo", "**feasible** proposition")
4. If the editorial lacks a clear word for one type, derive it from a non-bold but thematically central word in the editorial.
5. **NEVER reuse collocation pairs from other daily news articles.** Each editorial has its own vocabulary — use only the current editorial's words.

**Example — How Silverline editorial vocabulary produced Q26-Q30:**
| Q | Type | Editorial Word | Context in Editorial |
|---|------|---------------|---------------------|
| Q26 | Verb+Noun | **fillip** | "give a **fillip** to tourism" (line 95) |
| Q27 | Adverb+Verb | **brazenly** | "**brazenly** pushing ahead" (line 43) |
| Q28 | Adjective+Noun | **irreversible** | "**irreversible** damage" (line 34) |
| Q29 | Noun+Preposition | **precursor** | "a **precursor** to these mobility projects" (line 113) |
| Q30 | Adjective+Noun | **viable** | "**viable** alternatives" (line 43) |

**Quality Checklist for Section 6:**
- [ ] All 5 correct answers are vocabulary words extracted from the CURRENT editorial (NOT copied from other articles)?
- [ ] 5 different collocation types (Verb+Noun, Adverb+Verb, Adjective+Noun, Noun+Preposition, Adjective+Noun)?
- [ ] All 5 options per question are near-synonyms — 4 are non-idiomatic?
- [ ] Collocations match formal editorial register?
- [ ] Each correct answer traces back to a specific bold/hard word in the editorial body?
- [ ] No collocation word reused from a previous daily news article?

---

### 📂 Section 7 — Reading Comprehension (Q31-Q35):
**Difficulty Driver:** Questions refer to the editorial passage — tests deep reading, not skimming.

| Quality Rule | Description |
|-------------|-------------|
| **5 Distinct Skills** | Q31: Tone Analysis (Critical/Skeptical vs Supportive), Q32: Central Thesis (comprehensive main idea), Q33: Inference/Phrase Meaning (idiom in context), Q34: Weaken the Argument (critical reasoning), Q35: Implicit Assumption (author's unstated premise). Each tests a DIFFERENT comprehension skill. |
| **Direct Text Reference** | Q31 and Q32 answers must be directly supportable by editorial text. Q33 requires inferring from context. Q34 and Q35 require reasoning BEYOND the explicit text. |
| **Tone Precision** | Q31: Options must span 5 distinct tones. Avoid overlap (e.g., don't have both "critical" and "skeptical" as separate options). Source: Supportive, Objective/Statistical, Critical & Skeptical, Indifferent, Nostalgic — no overlap. |
| **Thesis Distinction** | Q32: Wrong options must be partially true but miss the nuance. Source: Option A "completely banned" (too extreme), B "only viable mode" (too narrow), D "deliberately sabotaged" (wrong claim), E "only standard gauge" (too specific). |
| **Weaken Question Design** | Q34: The correct answer must DIRECTLY attack the recommendation's premise. Source: KSSP recommends modernizing existing lines → weaken by saying existing lines CAN'T support high speeds. Wrong options attack irrelevant aspects. |
| **Assumption Question** | Q35: The assumption must be NECESSARY for the author's argument — if false, the argument collapses. Source: Author calls water transport "feasible" → must assume lock gate reconstruction will complete. |

**Quality Checklist for Section 7:**
- [ ] 5 different comprehension skills tested (no repeat)?
- [ ] Q31 tone options are mutually exclusive?
- [ ] Q32 wrong options are partially true but miss nuance?
- [ ] Q34 correct answer directly attacks the premise, not a side issue?
- [ ] Q35 assumption is TRULY necessary (negation test: if false, argument breaks)?

---

### 📂 Section 8 — Active & Passive Voice Transformation (Q36-Q40):
**Difficulty Driver:** Mains-level sentences (25-40 words) with embedded clauses, modal+perfect+passive chains, and ambiguous agent structures where wrong options differ from the correct by ONE subtle element.

| Quality Rule | Description |
|-------------|-------------|
| **🔴 CRITICAL: Mains Sentence Complexity** | Every source sentence MUST be 25-40 words, containing at least ONE embedded structure: (a) a relative clause ("which/that/who..."), (b) a passive construction within the active sentence, (c) a modal+perfect combination ("should have been", "must have"), or (d) a double-object structure. Short, single-clause sentences like "X is revamping Y" are PRELIMS level — REJECT them. |
| **Structure Variety** | Q36: **Complex sentence with relative clause** — active sentence has a relative clause; the passive must decide whether to transform the relative clause too. Q37: **Modal + Perfect + Passive chain** — "should have + V3" / "ought to have been + V3" / "must have been + V3" combinations. Q38: **Causative verb ("make/get/have") + bare infinitive trap** — "made them leave" → "were made to leave" (the 'to' appears ONLY in passive). Q39: **Imperative/Suggestion/Hortative** — sentences starting with "Let us...", "It is time to...", "One must...", or complex imperatives with conditions. Q40: **Passive-to-Active reversal with agent ambiguity** — passive sentence where the agent is buried in a prepositional phrase or a "by"-phrase must be extracted correctly. Each tests a DIFFERENT rule — NO repeats. |
| **🔴 Wrong Option Design (Mains Trap Levels)** | Each wrong option must test a SPECIFIC misconception: **Level 1 Trap:** Wrong tense in the auxiliary chain (e.g., "is being revamped" vs "was being revamped" vs "is revamped"). **Level 2 Trap:** Missing auxiliary in a chain of 3+ verbs (e.g., "should have consulted" → passive needs "should have BEEN consulted" — missing "been" is the classic Mains trap). **Level 3 Trap:** Wrong treatment of relative clauses — should the relative clause also change voice? Change only what's logical. **Level 4 Trap:** Causative "to" — students forget that "make" takes bare infinitive in active but "to-infinitive" in passive. **Level 5 Trap (Q40):** Wrong agent identification — passive has "by X" but the active subject should be "X", not some other noun. |
| **Agent Confusion (Q40 only)** | Q40 must test whether the student correctly identifies the DOER from a passive sentence where the agent appears in a "by"-phrase at the end. Wrong options should use the WRONG noun as the active subject. |
| **No Obvious Errors** | ❌ BANNED: S-V agreement errors ("the project were derailed"), spelling mistakes, tense errors a Prelims student could spot. ✅ REQUIRED: Structural errors only — wrong auxiliary chain, missing "been"/"being", wrong infinitive form, unnecessary voice change of a relative clause. |
| **Original Meaning Preservation** | The correct answer MUST preserve the exact meaning, tense, and nuance. No semantic shift — only structural transformation. |

**Sentence Construction Rules for Mains Level:**
- Q36: Source sentence must have a MAIN clause (present continuous active) + a RELATIVE clause (simple present). The passive should ONLY transform the main clause. Wrong options should incorrectly also transform the relative clause. Example: "Peak XV Partners is revamping Surge, its once-ambitious seed platform that offers a launchpad for startups." → Passive only on "is revamping" → "Surge... is being revamped by Peak XV Partners"; relative clause "that offers" stays untouched.
- Q37: Source must use a MODAL PERFECT ("should have consulted", "ought to have considered", "must have reviewed"). Passive = "should have BEEN consulted". Wrong options: missing "been" (most common Mains trap), wrong modal ("had to be consulted" instead of "should have been consulted"), or wrong tense in the perfect chain.
- Q38: Source must use causative "make" + bare infinitive ("made the associates leave"). Passive = "were made TO leave". Wrong options: missing "to", using present participle ("were made leaving"), wrong tense ("had been made leave"), or active reversal error.
- Q39: Source must be a COMPLEX imperative — NOT a simple "Do X". Use: "Let us...", "It is time to...", "One should...", or a conditional imperative. Wrong options: wrong "Let" structure ("Let + be + V3" is correct; "Let + V3" is wrong), missing "be", using "should" when "Let" is required, or mixing structures.
- Q40: Source must be a passive sentence with a CLEAR agent in a "by"-phrase. Active = extract agent as subject + "is yet to + V1". Wrong options: wrong agent as subject, wrong auxiliary ("has yet to" instead of "is yet to"), wrong verb form ("to raised" instead of "to raise"), or subject-verb disagreement.

**Quality Checklist for Section 8:**
- [ ] Every source sentence is 25-40 words with at least ONE embedded structure (relative clause, modal perfect, double object, or passive-within-active)?
- [ ] 5 DIFFERENT voice transformation rule types (no repeats)?
- [ ] Each wrong option tests exactly 1-2 specific Mains-level misconceptions (wrong auxiliary chain, missing "been"/"being", causative "to" trap, agent confusion)?
- [ ] NO Prelims-level errors (S-V agreement, spelling, obvious tense mismatch)?
- [ ] Correct option preserves original meaning perfectly — no semantic shift?
- [ ] Q36 relative clause stays in original voice (only main clause transforms)?
- [ ] Q37 tests modal+perfect+passive chain with "been" trap?
- [ ] Q38 tests causative "to-infinitive" in passive?
- [ ] Q39 is a complex imperative, NOT a simple "Do X"?
- [ ] Q40 correctly extracts the agent from a "by"-phrase in passive→active reversal?

---

### 📂 Section 9 — Direct & Indirect Speech — Narration (Q41-Q45):
**Difficulty Driver:** Mains-level narration requires 3-4 SIMULTANEOUS transformations per question — tense backshift + pronoun change + demonstrative shift + structural conversion (interrogative→assertive, imperative→infinitive, exclamatory→assertive). Wrong options miss ONE of these transformations.

| Quality Rule | Description |
|-------------|-------------|
| **🔴 CRITICAL: Mains Sentence Complexity** | Every direct speech sentence MUST be 20-35 words. The quoted portion must contain: (a) at least ONE embedded phrase or clause, (b) a mix of tenses (present perfect + simple present, or simple past + present), forcing the student to backshift EACH tense independently, and (c) at least one pronoun and one demonstrative that must change. Short single-clause quotes like "Sood is with Peak XV" are PRELIMS level — REJECT them. |
| **Sentence Type Variety** | Q41: **Assertive — Dual Tense Backshift** — quote contains TWO different tenses (e.g., "is very much with Peak XV but has transitioned..." or "has initiated and is modernising..."). Both must backshift independently. Q42: **Interrogative — Wh-question with embedded clause** — "Why did you reduce the frequency from two to one?" or "What action did the board take when it realized...?" Must handle: interrogative→assertive + tense backshift + pronoun change. Q43: **Imperative — Negative command with condition** — "Do not approve this deal without analyzing the startup's current debt burden." Must handle: "Do not"→"not to" + "this"→"that" + embedded gerund phrase must stay intact. Q44: **Modal — "must" retention vs. "had to" replacement** — "The team must take greater responsibility to ensure..." Must decide: does "must" stay or change to "had to"? (Retain when expressing permanent duty/rule; change to "had to" for one-time obligation). Q45: **Exclamatory — "What a..." / "How..." → assertive** — "What a massive strategic blunder this restructuring represents!" Must handle: "What a..."→"very" + assertive structure + "this"→"that" + present→past. Each tests a DIFFERENT narration concept — NO repeats. |
| **🔴 Multi-Transform Requirement** | Each Q41-Q45 must require 3-4 SIMULTANEOUS transformations. A question that only requires tense backshift alone is PRELIMS. Mains questions require: (1) Tense backshift on EACH verb independently, (2) Pronoun changes (I→he/she, we→they, your→his/her, my→his/her), (3) Demonstrative shifts (this→that, these→those, here→there, now→then, today→that day), (4) Structural conversion (interrogative→assertive word order, imperative→"to/not to" infinitive, exclamatory→assertive). |
| **🔴 Wrong Option Design (Mains Trap Levels)** | Each wrong option must test one SPECIFIC missed transformation: **Trap 1:** Missed tense backshift on ONE verb (backshifted verb A but not verb B). **Trap 2:** Wrong pronoun (kept "your" instead of changing to "his"/"her"). **Trap 3:** Wrong demonstrative (kept "this" instead of "that", kept "now" instead of "then"). **Trap 4:** Wrong structure (kept interrogative word order "why had he" instead of assertive "why he had"; used "that why" which is ungrammatical). **Trap 5 (Q44):** Over-applied backshift on "must" (changed "must" to "had to" when it should be retained; or kept "must" when it should change to "had to"). **Trap 6 (Q45):** Missed "very" intensifier or kept exclamatory structure or wrong tense. |
| **Q44 — "Must" vs "Had To" Decision Rule** | 🔴 This is the #1 Mains narration trick. Decision: If "must" expresses a PERMANENT RULE, CONTINUOUS DUTY, or STRONG ADVICE still valid at reporting time → RETAIN "must". If "must" expresses a ONE-TIME OBLIGATION or a PAST NECESSITY that no longer holds → CHANGE to "had to". Give 2 wrong options: one that incorrectly retains "must" and one that incorrectly changes to "had to". |
| **Q45 — Exclamatory Precision** | Exclamatory sentences starting with "What a..." or "How..." must transform to assertive sentences using "very" or "greatly". Additional checks: "this"→"that", present tense→past tense, exclamation mark removed, reporting verb changes to "exclaimed with surprise/joy/sorrow/disgust". Wrong options: miss "very" (keep "what a..."), wrong tense, wrong demonstrative, or wrong reporting verb emotion. |
| **No Obvious Errors** | ❌ BANNED: Direct speech left as-is in options, completely wrong reporting verb ("asked" instead of "stated"), random word changes. ✅ REQUIRED: Only subtle transformational misses as described above. |

**Sentence Construction Rules for Mains Level:**
- Q41 (Assertive): Source quote must have TWO different tenses. Example: "Sood is very much with Peak XV but has transitioned to an advisory role for a set period of time." Backshift: "is"→"was", "has transitioned"→"had transitioned". Both must happen independently. Wrong options: backshift one but not the other.
- Q42 (Interrogative): Source must be a Wh-question with past tense + content clause. Example: "Why did you reduce the annual cohort frequency from two to one?" Transform: "did you reduce"→"he had reduced" (past→past perfect) + "your" is not present; if "you"→"he". Structure: interrogative "Why did you..." → assertive "why he had...". Wrong options: keep interrogative structure ("why had he"), add "that why", miss tense backshift, or miss pronoun change.
- Q43 (Imperative Negative): Source must have "Do not" + V1 + object with "this/these" demonstrative. "Do not"→"not to". "this/these"→"that/those". Any embedded gerund phrase stays unchanged. Wrong options: "to not" (wrong order), keep "this", or change gerund incorrectly.
- Q44 (Modal): Source "must" in a context where retention is the correct move (permanent duty/rule). Must provide BOTH: option with "must" retained (correct) AND option with "had to" (trap). Wrong options also include "should", "has to", or "must have".
- Q45 (Exclamatory): Source "What a..." followed by noun phrase. Transform: "What a [adj] [noun] this [verb]!" → "[that] [noun] [verb-past] a very [adj] [noun]". Wrong options: miss "very", keep "this", keep present tense, use wrong reporting emotion.

**Quality Checklist for Section 9:**
- [ ] Every direct speech quote is 20-35 words with at least ONE embedded phrase/clause?
- [ ] 5 DIFFERENT narration sentence types (no repeats)?
- [ ] Each question requires 3-4 simultaneous transformations?
- [ ] Q41 has TWO different tenses in the quote, both backshifted independently in the correct answer?
- [ ] Q42 correctly converts interrogative to assertive word order + pronoun change + tense backshift?
- [ ] Q43 correctly handles "Do not"→"not to" + "this"→"that" demonstrative shift?
- [ ] Q44 correctly tests the "must retention" decision with BOTH traps (wrong retention and wrong "had to")?
- [ ] Q45 correctly transforms exclamatory→assertive with "very" + "this"→"that" + tense backshift?
- [ ] Each wrong option misses exactly ONE of the required transformations?
- [ ] NO Prelims-level errors (direct speech left as-is, completely wrong reporting verb)?
- [ ] Reporting verbs vary across Q41-Q45 (stated/said, asked/enquired, told/advised/ordered, remarked/observed, exclaimed)?

---

### 📊 Section-Level Quality Summary Table:

| Section | Primary Trick | Wrong Option Strategy | Difficulty Driver |
|---------|--------------|----------------------|-------------------|
| S1 — Vocab Shifts | Semantic shift, not grammar | All sentences grammatically correct; only meaning differs | Polysemy + domain awareness |
| S2 — Error Detection | Errors hidden by complex structure | Wrong options point to correct parts | Intervening phrases mask errors |
| S3 — Triple Fillers | One word, 3 unrelated domains | Near-synonyms work in 1-2 sentences but fail in the third | Contextual flexibility + domain knowledge |
| S4 — Fragment Completion | Common-mistake fragments sound right | Fragments that violate advanced rules but sound natural | Sound-right trap |
| S5 — Para Jumbles | Only transitional logic decides order | Nearly-logical sequences wrong by 1 position | Pronoun chains + transitional markers |
| S6 — Collocations | Near-synonyms, only 1 idiomatic | All options semantically similar, 4 non-idiomatic | Idiomatic precision |
| S7 — Reading Comprehension | Deep reading required, not skimming | Partially true options that miss nuance | Critical reasoning + inference |
| S8 — Voice | Structural errors in multi-verb auxiliary chains | One element wrong: missing "been"/"being", causative "to" trap, wrong agent in passive→active | 25-40 word sentences + embedded clauses + modal-perfect-passive chains |
| S9 — Narration | 3-4 simultaneous transformations, one missed per wrong option | Missing ONE of: tense backshift on each verb, pronoun change, demonstrative shift, or structural conversion | 20-35 word quotes + dual tense backshift + multi-transform coordination |

---

### 🚫 Common Mistakes to AVOID (Anti-Patterns):

1. **❌ Ambiguous correct answer:** "Both B and C could be right depending on..." → NEVER. Only one objectively correct answer.
2. **❌ Testing obscure/rare rules:** Don't test exceptions that appear once in 10 years of exams. Test HIGH-FREQUENCY Mains patterns.
3. **❌ Repeating the same concept:** Don't have two subjunctive questions in S2 or two Verb+Noun collocations in S6.
4. **❌ Options that give away the answer:** If 4 options are long and 1 is short, the short one is probably correct. Balance option lengths.
5. **❌ Non-editorial vocabulary:** In S1, PS must use the word as it appears in the editorial. Don't invent new contexts for the Principal Sentence.
6. **❌ Random wrong sequences in S5:** Each wrong sequence must be LOGICAL but wrong. Don't create random letter combinations.
7. **❌ Overlapping tone words in Q31:** "Critical" and "Skeptical" as separate options → merge into one option.
8. **❌ Prelims-level Voice sentences (S8):** Short, single-clause sentences like "X is revamping Y" or "They have launched a new fund." → REJECT. Every Q36-Q40 source sentence MUST be 25-40 words with at least one embedded clause, modal-perfect chain, or complex structure.
9. **❌ Obvious voice errors (S8):** "The project were derailed" (obvious S-V error), spelling mistakes, or tense errors a Prelims student could spot → REJECT. Wrong options must contain SUBTLE structural errors only: missing "been"/"being" in auxiliary chains, causative "to" trap, wrong agent in passive→active reversal, unnecessary voice change of a relative clause.
10. **❌ Voice with no structural complexity (S8):** A single-verb passive transformation ("He wrote a letter." → "A letter was written by him.") → REJECT. Every Q36-Q40 must have 3+ verbs in the auxiliary chain or a mixed-structure sentence where only part transforms.
11. **❌ Prelims-level Narration quotes (S9):** Short single-clause quotes like "Sood is with Peak XV" or "He said, 'I am going.'" → REJECT. Every Q41-Q45 direct speech quote MUST be 20-35 words with embedded phrases and mixed tenses.
12. **❌ Single-transformation Narration (S9):** A question that only requires tense backshift with no pronoun/demonstrative/structural change → REJECT. Every Q41-Q45 must require 3-4 SIMULTANEOUS transformations.
13. **❌ Direct speech left as-is (S9):** Wrong options that keep direct speech structure unchanged → too easy to spot. Wrong options must have all but ONE transformation applied correctly.
14. **❌ Wrong "must" handling (S9 Q44):** Not providing BOTH traps (wrongly retained "must" AND wrongly changed "had to") → REJECT. Q44 must include both trap types as wrong options.
15. **❌ Missed "very" in exclamatory (S9 Q45):** Wrong options that keep "What a..." structure or miss the "very" intensifier → too easy. Q45 wrong options must test subtler traps: wrong tense alongside correct "very", or wrong demonstrative with everything else correct.

---

## 🔢 14. Blank Line Spacing Rules

**Consistent throughout the file:**

```
**Options:**
(A) [A] 
(B) [B] 
...
(E) [E]


                                          ← Exactly 2 blank lines
**Correct - [LETTER]**
**Reasoning:**
[Explanation...]


                                          ← Exactly 1 blank line
---
                                          ← Horizontal rule
```

- Between Options and Correct: **exactly 2 blank lines**
- Between Reasoning and HR: **exactly 1 blank line**
- Between HR and next #### Q heading: varies

---

## 🏗️ 15. Complete File Template

```markdown
---
date: "[YYYY-MM-DD]"
title: "[EDITORIAL TITLE EN] — [YEAR] Advanced English Grammar & Vocabulary Masterclass | 45-Question Practice Set for SSC CGL, IBPS PO, SBI PO Mains"
metaDescription: "[YEAR] latest: Master SSC CGL Tier 2 and IBPS PO Mains English with this advanced 45-question practice set based on the [TOPIC] editorial ([YEAR]). Covers Contextual Vocabulary, Error Detection, Triple Fillers, Para Jumbles, Collocations, Reading Comprehension, Active-Passive Voice, and Direct-Indirect Narration with detailed Hindi-English explanations. Updated for [YEAR] exam pattern."
keywords: "[YEAR] SSC CGL Tier 2 advanced English practice, [YEAR] IBPS PO Mains error spotting questions, [YEAR] English vocabulary with Hindi meaning for bank exams, [YEAR] [TOPIC SLUG] editorial analysis, [YEAR] para jumbles practice PDF, [YEAR] active passive voice exercises SSC, [YEAR] direct indirect speech narration, [YEAR] triple fillers bank exams, [YEAR] collocations IBPS PO, [YEAR] reading comprehension Mains level, kajubadamvocabulary daily news vocab [YEAR], latest [YEAR] English grammar practice set"
author: "kajubadamvocabulary.in"
source: "[NEWSPAPER]"
slug: "[YYYY-MM-DD]"
ogTitle: "[YEAR] [TOPIC] Editorial — 45 Advanced English Questions for SSC CGL & IBPS PO Mains (Latest)"
ogDescription: "[YEAR] latest: Free daily editorial-based English practice set with 45 Mains-level questions. Contextual vocabulary shifts, error detection, para jumbles, triple fillers, voice, narration & reading comprehension with bilingual explanations. Updated for [YEAR] exams."
aeoDefinition: "This [YEAR] comprehensive page provides a complete editorial analysis of [TOPIC] ([YEAR]), followed by 45 advanced English grammar and vocabulary questions designed for [YEAR] SSC CGL Tier 2, IBPS PO Mains, SBI PO, and other competitive exams. Each question includes detailed Hindi-English explanations covering [GRAMMAR TOPICS]. The editorial serves as a complete Reading Comprehension passage for exam practice. Updated for the latest [YEAR] exam pattern."
---

# [EDITORIAL TITLE EN] — [HINDI TRANSLATION]

## *[EDITORIAL SUBTITLE EN]*
## *[EDITORIAL SUBTITLE HI]*

**S. Anandan**
**एस. आनंदन**

### [SUB-SECTION 1 EN]
### [SUB-SECTION 1 HI]

[EN paragraph 1 with **bold** vocabulary]

[HI paragraph 1 with **bold** vocabulary]

[EN paragraph 2 with **bold** vocabulary]

[HI paragraph 2 with **bold** vocabulary]

... (continue EN→HI pairs for sub-section 1) ...

### [SUB-SECTION 2 EN]
### [SUB-SECTION 2 HI]

[EN paragraph N with **bold** vocabulary]

[HI paragraph N with **bold** vocabulary]

... (continue EN→HI pairs for sub-section 2) ...

---

## 📝 Advanced English Grammar & Vocabulary Masterclass: 45-Question Practice Set
*Published by the Academic Editorial Team at [kajubadamvocabulary.in](https://kajubadamvocabulary.in)*

Welcome to the ultimate preparation guide for advanced English grammar and vocabulary. This premium Super Mock level practice set is designed by the experts at **kajubadamvocabulary.in** based on the recent editorial regarding the [TOPIC].

---

### 📂 Section 1: Context-Based Vocabulary Shifts (Q1-Q5)

> [Polysemy/AEO blockquote — 1-2 sentences. NO label prefix.]

**Directions (Q1-Q5):** Choose the sub-sentence(s) where the bold word has a DIFFERENT meaning from how it is used in the Principal Sentence (PS).

#### Q1. Contextual Vocabulary — "[WORD 1]"
*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*

**Question:** *(Target: Find the sentence where the bold word has a DIFFERENT meaning)*
**Principal Sentence:** [PS with **bold** word]
**Sub-Sentences:**
**I.** [Sentence with **bold** word]
**II.** [Sentence with **bold** word]
**III.** [Sentence with **bold** word]

**Options:**
(A) Only I 
(B) Both I and II 
(C) Both II and III 
(D) Only II 
(E) All I, II, and III



**Correct - [LETTER]**
**Reasoning:**
[Explanation...]


---
#### Q2. Contextual Vocabulary — "[WORD 2]"
*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*

**Question:** *(Target: Find the sentence where the bold word has a DIFFERENT meaning)*
**Principal Sentence:** [PS with **bold** word]
**Sub-Sentences:**
**I.** [Sentence with **bold** word]
**II.** [Sentence with **bold** word]
**III.** [Sentence with **bold** word]

**Options:**
(A) Only I 
(B) Both I and III 
(C) Both II and III 
(D) Only II 
(E) All I, II, and III



**Correct - [LETTER]**
**Reasoning:**
[Explanation...]


---
#### Q3. Contextual Vocabulary — "[WORD 3]"
*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*

[Same structure as Q2, different option pattern per question...]

---
#### Q4. Contextual Vocabulary — "[WORD 4]"
*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q5. Contextual Vocabulary — "[WORD 5]"
*Section: Contextual Vocabulary Shifts — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 2: Advanced Error Detection (Q6-Q10)

**Directions (Q6-Q10):** Each question below contains a sentence divided into three parts — (I), (II), and (III). Identify the part(s) that contain a grammatical error. If the sentence is error-free, mark "No error" as your answer.

#### Q6. Spotting the Error — [Error Type 1]
*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*

**Question:**
[Sentence with (I) / (II) / (III) markers]

**Options:**
(A) Only (I) 
(B) Only (II) 
(C) Both (I) and (III) 
(D) Both (II) and (III) 
(E) None of (I), (II) & (III)



**Correct - [LETTER]**
**Reasoning:**
[Explanation...]


---
#### Q7. Spotting the Error — [Error Type 2]
*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*

[Same structure, no source line...]

---
#### Q8. Spotting the Error — [Error Type 3]
*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q9. Spotting the Error — [Error Type 4]
*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q10. Spotting the Error — [Error Type 5]
*Section: Advanced Spotting the Error — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 3: Triple-Sentence Fillers (Q11-Q15)

**Directions (Q11-Q15):** Each question below has three separate sentences, each with a blank. Choose the SINGLE word from the options that fits meaningfully and grammatically in ALL three sentences.

#### Q11. Triple Filler — [Subtype 1]
*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*

**Question:**
**I.** [Sentence — Domain 1]
**II.** [Sentence — Domain 2]
**III.** [Sentence — Domain 3]

**Options:**
(A) [Word A] 
(B) [Word B] 
(C) [Word C] 
(D) [Word D] 
(E) [Word E]



**Correct - [LETTER]**
**Reasoning:**
[Explanation of why this word fits all 3 domains...]


---
#### Q12. Triple Filler — [Subtype 2]
*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*

[Same structure, no source line...]

---
#### Q13. Triple Filler — [Subtype 3]
*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q14. Triple Filler — [Subtype 4]
*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q15. Triple Filler — [Subtype 5]
*Section: Triple-Sentence Fillers — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 4: Fragment Completion (Q16-Q20)

**Directions (Q16-Q20):** Each question below contains a root sentence with a blank, followed by three sentence fragments (I, II, III). Choose the option that identifies which fragment(s) grammatically and contextually complete the given sentence.

#### Q16. Fragment Completion — [Grammar Topic 1]
*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*

**Question:**
**Root Sentence:** [Sentence with ________ blank]
**Fragments:**
**I.** [Fragment 1]
**II.** [Fragment 2]
**III.** [Fragment 3]

**Options:**
(A) Only I 
(B) Only II 
(C) Both I and II 
(D) Both II and III 
(E) All I, II, and III



**Correct - [LETTER]**
**Reasoning:**
[Grammar rule explanation...]


---
#### Q17. Fragment Completion — [Grammar Topic 2]
*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*

[Same structure — NO source line...]

---
#### Q18. Fragment Completion — [Grammar Topic 3]
*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q19. Fragment Completion — [Grammar Topic 4]
*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q20. Fragment Completion — [Grammar Topic 5]
*Section: Fragment Completion — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 5: Advanced Para Jumbles — Sentence Rearrangement (Q21-Q25)

> [Para jumble strategy — 1-2 sentences. NO label prefix.]

**Directions (Q21-Q25):** Each question below contains six sentences (A, B, C, D, E, F). Rearrange them to form a coherent paragraph. Choose the option that represents the CORRECT logical sequence.

---
#### Q21. Para Jumble — [UNIQUE TOPIC 1]
*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*

**Sentences:**
*   **(A)** [Sentence A]
*   **(B)** [Sentence B]
*   **(C)** [Sentence C — usually topic introducer]
*   **(D)** [Sentence D — usually "This is because..."]
*   **(E)** [Sentence E — usually "Furthermore..." / "However..."]
*   **(F)** [Sentence F — usually conclusion]

**Options (Correct Sequence):**
(A) [C - D - E - B - A - F]
(B) [C - E - D - B - A - F]
(C) [D - C - E - B - F - A]
(D) [C - D - B - E - A - F]
(E) [D - E - C - B - A - F]



**Correct - [LETTER]**
**Sequence:** [X] → [Y] → [Z] → [A] → [B] → [C]
**Reasoning:**
[C introduces topic (X)]. [D explains ("This is because…" → Y)]. [E adds ("Furthermore…" → Z)]. [B shows result ("Consequently…")]. [A proposes solution ("Rather than…")]. [F concludes ("Such an approach…")].

---
#### Q22. Para Jumble — [UNIQUE TOPIC 2]
*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*

[Same structure, no source line, DIFFERENT topic and sentences...]

---
#### Q23. Para Jumble — [UNIQUE TOPIC 3]
*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*

[Same structure, DIFFERENT topic...]

---
#### Q24. Para Jumble — [UNIQUE TOPIC 4]
*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*

[Same structure, DIFFERENT topic...]

---
#### Q25. Para Jumble — [UNIQUE TOPIC 5]
*Section: Advanced Para Jumbles — IBPS PO / SSC CGL Mains Level*

[Same structure, DIFFERENT topic...]

---

### 📂 Section 6: Collocations (Q26-Q30)

**Directions (Q26-Q30):** Each question below contains a sentence with a blank. From the given options, choose the word that forms the most idiomatic and contextually appropriate collocation to complete the sentence.

#### Q26. Collocation — [Type 1]
*Section: Collocations — IBPS PO / SSC CGL Mains Level*
*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*

**Question:**
[Sentence with ________ blank]

**Options:**
(A) [A] 
(B) [B] 
(C) [C] 
(D) [D] 
(E) [E]



**Correct - [LETTER]**
**Reasoning:**
[Collocation explanation — why this word forms the standard pair...]


---
#### Q27. Collocation — [Type 2]
*Section: Collocations — IBPS PO / SSC CGL Mains Level*

[Same structure, no source line...]

---
#### Q28. Collocation — [Type 3]
*Section: Collocations — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q29. Collocation — [Type 4]
*Section: Collocations — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q30. Collocation — [Type 5]
*Section: Collocations — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 7: Reading Comprehension (Q31-Q35)

**Directions (Q31-Q35):** Read the editorial passage provided at the beginning of this article carefully and answer the questions that follow. Each question tests a different comprehension skill — tone, inference, theme, detail, and vocabulary-in-context.

#### Q31. Reading Comprehension — [Skill 1 — e.g., Tone Analysis]
*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*

**Question:**
[Question about the editorial]

**Options:**
(A) [A] 
(B) [B] 
(C) [C] 
(D) [D] 
(E) [E]



**Correct - [LETTER]**
**Reasoning:**
[Textual evidence from editorial...]


---
#### Q32. Reading Comprehension — [Skill 2 — e.g., Central Thesis]
*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q33. Reading Comprehension — [Skill 3 — e.g., Phrase Inference]
*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q34. Reading Comprehension — [Skill 4 — e.g., Argument Weakening]
*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q35. Reading Comprehension — [Skill 5 — e.g., Implicit Assumption]
*Section: Reading Comprehension — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 8: Active & Passive Voice Transformation (Q36-Q40)

> [Voice transformation complexity — 1-2 sentences. NO label prefix.]

**Directions (Q36-Q40):** A sentence has been given in Active/Passive Voice. Out of the five alternatives suggested, select the one which best expresses the same sentence in Passive/Active Voice.

#### Q36. Voice Transformation — [Type 1]
*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*

**Question:**
[Active/Passive sentence]

**Options:**
(A) [Transformed A] 
(B) [Transformed B] 
(C) [Transformed C] 
(D) [Transformed D] 
(E) [Transformed E]



**Correct - [LETTER]**
**Reasoning:**
[Voice transformation rule...]


---
#### Q37. Voice Transformation — [Type 2]
*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q38. Voice Transformation — [Type 3]
*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q39. Voice Transformation — [Type 4]
*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q40. Voice Transformation — [Type 5]
*Section: Active & Passive Voice — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

### 📂 Section 9: Direct & Indirect Speech — Narration (Q41-Q45)

**Directions (Q41-Q45):** Each question below presents a sentence in Direct Speech. From the given alternatives, select the option that MOST ACCURATELY expresses the same sentence in Indirect Speech, following the rules of narration.

#### Q41. Narration — [Type 1 — e.g., Assertive Sentence]
*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*

**Question:**
[Direct speech sentence — "Quoted," said X.]

**Options:**
(A) [Indirect A] 
(B) [Indirect B] 
(C) [Indirect C] 
(D) [Indirect D] 
(E) [Indirect E]



**Correct - [LETTER]**
**Reasoning:**
[Narration rule explanation...]


---
#### Q42. Narration — [Type 2 — e.g., Interrogative]
*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q43. Narration — [Type 3 — e.g., Imperative]
*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q44. Narration — [Type 4 — e.g., Modal Transformation]
*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---
#### Q45. Narration — [Type 5 — e.g., Exclamatory]
*Section: Direct & Indirect Speech — IBPS PO / SSC CGL Mains Level*

[Same structure...]

---

##  What are the most important vocabulary words from this editorial?

**Answer:** Here are the **top 15 exam-relevant vocabulary words** from the [TOPIC] editorial with Hindi meanings:

| # | English Word | Hindi Meaning | Context in Editorial |
|---|-------------|---------------|---------------------|
| 1 | **[WORD 1]** | [HINDI] | [CONTEXT] |
| 2 | **[WORD 2]** | [HINDI] | [CONTEXT] |
| 3 | **[WORD 3]** | [HINDI] | [CONTEXT] |
| 4 | **[WORD 4]** | [HINDI] | [CONTEXT] |
| 5 | **[WORD 5]** | [HINDI] | [CONTEXT] |
| 6 | **[WORD 6]** | [HINDI] | [CONTEXT] |
| 7 | **[WORD 7]** | [HINDI] | [CONTEXT] |
| 8 | **[WORD 8]** | [HINDI] | [CONTEXT] |
| 9 | **[WORD 9]** | [HINDI] | [CONTEXT] |
| 10 | **[WORD 10]** | [HINDI] | [CONTEXT] |
| 11 | **[WORD 11]** | [HINDI] | [CONTEXT] |
| 12 | **[WORD 12]** | [HINDI] | [CONTEXT] |
| 13 | **[WORD 13]** | [HINDI] | [CONTEXT] |
| 14 | **[WORD 14]** | [HINDI] | [CONTEXT] |
| 15 | **[WORD 15]** | [HINDI] | [CONTEXT] |


## ❓ Frequently Asked Questions (FAQ)

### Q1. What is [TOPIC] and why was it [ACTION]?

**Answer:** [TOPIC] ([HINDI TRANSLATION]) was [WHAT IT WAS]. [WHO] [ACTION] it [WHEN/CONTEXT]. The [ACTION] happened for three main reasons: **(1) [REASON 1 NAME]** — [explanation with specific details]; **(2) [REASON 2 NAME]** — [explanation with specific details]; **(3) [REASON 3 NAME]** — [explanation with specific details]. [CONCLUDING SENTENCE].

### Q2. Which competitive exams is this practice set useful for?

**Answer:** This 45-question practice set is specifically designed for **Mains-level** competitive exams including:
- **SSC CGL Tier 2** (Staff Selection Commission — Combined Graduate Level)
- **IBPS PO Mains** (Institute of Banking Personnel Selection — Probationary Officer)
- **SBI PO Mains** (State Bank of India — Probationary Officer)
- **CDS** (Combined Defence Services)
- **UPSC CAPF** (Central Armed Police Forces)
- Any banking or government exam testing advanced English grammar, vocabulary, and reading comprehension.

The difficulty level is **Super Mock / Mains level**, meaning it targets the most challenging questions that appear in the final stage of these exams.

### Q3. How to use this editorial for Reading Comprehension practice?

**Answer:** Follow this 3-step approach for maximum benefit:

**Step 1 — Read the Editorial First:** Read the English editorial (top section) carefully without looking at the Hindi translation. Try to understand the central thesis, author's tone, and key arguments. This builds reading speed and comprehension.

**Step 2 — Attempt Q31-Q35 (Reading Comprehension Section):** These 5 questions test [SKILL 1], [SKILL 2], [SKILL 3], [SKILL 4], and [SKILL 5] — exactly the question types asked in IBPS PO and SSC CGL Mains.

**Step 3 — Cross-check with Hindi Translation:** Use the Hindi translation to verify your understanding of complex sentences and vocabulary. The bilingual format ensures you grasp both the literal meaning and contextual nuance of each word.

**Pro Tip:** The bold words in the editorial are the high-frequency vocabulary words tested in the Synonyms, Antonyms, and Contextual Vocabulary sections.

### Q4. What is the best strategy to solve [HARDEST SECTION] in bank exams?

**Answer:** [SECTION NAME] [ARE/IS] a high-scoring topic in IBPS PO and SBI PO Mains. Follow this **5-step strategy**:

1. **[STEP 1 TITLE]:** [Specific actionable explanation]
2. **[STEP 2 TITLE]:** [Explanation focused on pattern recognition]
3. **[STEP 3 TITLE]:** [Explanation about key signals/markers]
4. **[STEP 4 TITLE]:** [Explanation about logical flow/chaining]
5. **[STEP 5 TITLE]:** [Explanation about verification/closure]

### Q5. Can I download this practice set as a PDF?

**Answer:** Currently, this practice set is available as an interactive web page on **[kajubadamvocabulary.in](https://kajubadamvocabulary.in)**. The interactive format allows you to:
- Attempt each question and get instant feedback (correct/incorrect)
- View detailed Hindi-English explanations after each answer
- Track your progress across all 9 sections

For offline practice, you can use your browser's **Print → Save as PDF** feature (Ctrl+P / Cmd+P) to generate a PDF version. We recommend attempting the questions online first to benefit from the interactive feedback, then using the PDF for revision.

### Q6. How to improve [SKILL] for [EXAM]?

**Answer:** [SKILL] is one of the most scoring yet tricky topics in [EXAM] English. Here's a systematic approach:

1. **Master the Top [N] [SKILL] Types:** [List the key types with brief descriptions]
2. **[STEP 2 TITLE]:** [Actionable technique with example]
3. **[STEP 3 TITLE]:** [What to check first and how]
4. **[STEP 4 TITLE]:** [Pattern recognition approach]
5. **Practice Daily with Editorials:** Real editorial sentences (like those from [SOURCE]) contain naturally complex structures that mirror exam patterns. The 5 questions in each daily news set are crafted from actual editorial sentences.


---

## 🎓 Keep Learning with kajubadamvocabulary.in
Clear, conceptual English preparation is key to cracking Mains-level examinations. For more advanced practice sets, grammar concept cards, and targeted vocabulary lists, bookmark **[kajubadamvocabulary.in](https://kajubadamvocabulary.in)** as your daily study companion. Have a question about these explanations? Leave us a comment!
```

---

## ✅ 16. Verification Checklist — AI Output Must Pass ALL

Before accepting any AI-generated article against this blueprint, verify EVERY item:

### Frontmatter & Structure
- [ ] Frontmatter has exactly **10 fields** (not 11, not 9)
- [ ] `date`, `slug` match and are `YYYY-MM-DD` format
- [ ] `title` contains ` — ` separator between EN title and `[YEAR] Advanced English Grammar...`
- [ ] `keywords` has exactly 12 comma-separated items
- [ ] `author` is `"kajubadamvocabulary.in"`
- [ ] `aeoDefinition` starts with `"This [YEAR] comprehensive page..."`
- [ ] All frontmatter fields include the year for freshness

### Headings
- [ ] Exactly **1 H1** — editorial title EN — HI on single line
- [ ] Exactly **5 H2** headings (2 italic subtitles + Practice Set + Vocab + FAQ + Keep Learning)
- [ ] Editorial subtitles are italic: `## *text*`
- [ ] Practice Set H2: `## 📝 Advanced English Grammar & Vocabulary Masterclass: 45-Question Practice Set`
- [ ] Vocabulary H2: `##  What are the most important vocabulary words from this editorial?` (TWO spaces, NO emoji)
- [ ] FAQ H2: `## ❓ Frequently Asked Questions (FAQ)`
- [ ] Keep Learning H2: `## 🎓 Keep Learning with kajubadamvocabulary.in`
- [ ] H3 editorial sub-sections have Hindi translation on the next line
- [ ] All 9 section headers are `### 📂 Section N: [Name] (Q[range])`
- [ ] FAQ questions are `### QN.` format
- [ ] All 45 question headings are `#### Q[N]. [Type] — [Description]`

### Editorial Body
- [ ] Every English paragraph followed by Hindi paragraph
- [ ] Bold vocabulary words match between EN and HI
- [ ] Author byline is **bold** (not a heading), EN then HI
- [ ] Editorial has at least 2 H3 sub-sections with Hindi translations

### Sections
- [ ] Exactly 9 sections (Q1-Q45, 5 per section)
- [ ] Sections 1, 5, 8 have `>` AEO blockquotes with NO label prefix
- [ ] Sections 2, 3, 4, 6, 7, 9 have NO blockquotes
- [ ] ALL 9 sections have `**Directions (QX-QY):**` with correct question ranges
- [ ] Section 1 directions use "DIFFERENT meaning" text exactly
- [ ] Section 5 directions use "CORRECT logical sequence" text exactly

### Question Metadata
- [ ] All 45 questions have `*Section: ... — IBPS PO / SSC CGL Mains Level*`
- [ ] Source line `*(Source: Daily Editorial Analysis | Curated by kajubadamvocabulary.in)*` ONLY on: Q1, Q6, Q11, Q21, Q26
- [ ] Sections 4, 7, 8, 9 have NO source lines on ANY question

### Section 5 Special Rules
- [ ] 5 UNIQUE topics for Q21-Q25 (not all from the same domain)
- [ ] 6 unique sentences A-F per question
- [ ] Question header uses `**Sentences:**` (not `**Question:**`)
- [ ] Options header uses `**Options (Correct Sequence):**` (not just `**Options:**`)
- [ ] Each option is a 6-letter sequence like `(A) C - D - E - B - A - F`
- [ ] Answer has `**Sequence:** [X] → [Y] → [Z] → [A] → [B] → [C]` between Correct and Reasoning

### Section 6 Collocations — Vocabulary Source Check (🔴 CRITICAL)
- [ ] All 5 correct answers (Q26-Q30) are vocabulary words from the **CURRENT editorial** body
- [ ] Each correct answer traces to a specific bold/hard word in the editorial (not copied from another article)
- [ ] NO collocation words reused from previous daily news articles (fillip, brazenly, irreversible, precursor, viable were Silverline; other editorials must use their OWN vocabulary)
- [ ] 5 different collocation types used (Verb+Noun, Adverb+Verb, Adjective+Noun, Noun+Preposition, Adjective+Noun)
- [ ] Each Q26-Q30 blank sentence relates to the editorial's topic/theme (not generic)

### Section 8 Voice — Mains Level Check (🔴 CRITICAL)
- [ ] Every Q36-Q40 source sentence is 25-40 words with at least ONE embedded structure (relative clause / modal perfect / double object / passive-within-active)?
- [ ] 5 DIFFERENT voice transformation rule types used (no repeats): relative clause split, modal+perfect+passive chain, causative "to" trap, complex imperative, passive→active agent extraction?
- [ ] Each wrong option tests exactly 1-2 specific Mains-level misconceptions (missing "been"/"being", causative "to", wrong agent, unnecessary relative clause transformation)?
- [ ] NO Prelims-level errors in any option (S-V agreement, spelling mistakes, obvious tense mismatch)?
- [ ] Q36 relative clause stays in original voice while main clause transforms?
- [ ] Q37 modal+perfect+passive chain has "been" correctly placed; wrong options miss "been"?
- [ ] Q38 causative "make" → "were made TO leave" — the "to" appears only in passive; wrong options miss "to"?
- [ ] Q39 is a complex imperative ("Let us...", "It is time to...", or conditional), NOT a simple "Do X"?
- [ ] Q40 correctly extracts agent from "by"-phrase in passive→active reversal; wrong options use wrong agent as subject?
- [ ] All wrong options are structurally plausible (grammatically valid but transform incorrectly)?

### Section 9 Narration — Mains Level Check (🔴 CRITICAL)
- [ ] Every Q41-Q45 direct speech quote is 20-35 words with at least ONE embedded phrase/clause and mixed tenses?
- [ ] 5 DIFFERENT narration sentence types used (no repeats): assertive dual-tense, interrogative Wh-question, negative imperative, modal "must" decision, exclamatory?
- [ ] Each Q41-Q45 requires 3-4 SIMULTANEOUS transformations (tense backshift + pronoun change + demonstrative shift + structural conversion)?
- [ ] Q41 has TWO different tenses in the quote, both backshifted INDEPENDENTLY in the correct answer; wrong options backshift only one?
- [ ] Q42 correctly converts interrogative "did you..." → assertive "he had..." (word order + tense + pronoun all changed)?
- [ ] Q43 correctly handles "Do not"→"not to" + "this"→"that" demonstrative shift; wrong options keep "this" or use "to not"?
- [ ] Q44 provides BOTH trap options: one wrongly retaining "must" and one wrongly changing to "had to"?
- [ ] Q45 correctly transforms exclamatory→assertive with "very" intensifier + "this"→"that" + tense backshift + correct reporting emotion?
- [ ] Each wrong option misses exactly ONE of the 3-4 required transformations (not multiple)?
- [ ] NO Prelims-level errors (direct speech left as-is, completely wrong reporting verb, random word changes)?
- [ ] Reporting verbs vary across Q41-Q45 (stated, asked/enquired, told/advised/ordered, remarked/observed, exclaimed)?

### Answer Format
- [ ] All 45 answers: `**Correct - [LETTER]**` (space before/after hyphen, uppercase letter)
- [ ] All 45 answers: `**Reasoning:**` (exact spelling and bold)
- [ ] Section 5 answers: `**Sequence:**` line between Correct and Reasoning
- [ ] Exactly 2 blank lines between Options end and Correct
- [ ] Exactly 1 blank line between Reasoning end and HR

### Vocabulary Table
- [ ] H2 header has TWO spaces after `##`, NO emoji
- [ ] Answer line: `**Answer:** Here are the **top 15 exam-relevant vocabulary words**...`
- [ ] 4-column markdown table: `#`, `English Word`, `Hindi Meaning`, `Context in Editorial`
- [ ] Exactly 15 data rows
- [ ] English words are **bold** in the table
- [ ] Content relevant to the editorial

### FAQ Section
- [ ] Exactly 6 FAQ items (Q1-Q6)
- [ ] NO AEO/GEO/SEO question
- [ ] Q2 has the standard exam list answer (copy-paste exact)
- [ ] Q3 has the standard 3-step RC approach (copy-paste exact)
- [ ] Q5 has the standard PDF answer (copy-paste exact)
- [ ] Q1, Q4, Q6 are topic-specific
- [ ] Each FAQ header is `### QN.` format

### Keep Learning
- [ ] H2 `## 🎓 Keep Learning with kajubadamvocabulary.in`
- [ ] Standard text with bold link to kajubadamvocabulary.in
- [ ] Single paragraph

### File Hygiene
- [ ] File ends with exactly one newline
- [ ] No trailing whitespace
- [ ] Total lines: approximately 1250-1350
- [ ] All `---` horizontal rules are on their own line