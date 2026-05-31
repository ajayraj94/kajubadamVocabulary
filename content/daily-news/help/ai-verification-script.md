# 🤖 AI Automated Verification Script
## For: 40-Question Premium Practice Set (kajubadamvocabulary.in)
### Editorial Source: `passage.md` | Standard: SSC CGL Mains / Bank PO Mains

---

> **HOW TO USE THIS SCRIPT:**
> After the 40-question set is generated, paste it and run the following AI check prompts one by one. Each check will auto-validate a specific quality layer.

---

## ✅ CHECK 1: Answer Key Alignment Verification

**AI Prompt to Run:**
```
Read the entire 40-question set. For each question:
1. Identify the "Correct Answer" key (e.g., "Ans: B").
2. Identify the "Correct Replacement" or "Correct Option Text" in the explanation.
3. Cross-check: Does the key letter (B) exactly match the replacement text in the explanation?
4. Output a table: | Q.No | Key Letter | Replacement Segment | PASS / FAIL |
Flag any question where the key and replacement do not align 100%.
```

**Expected Output:**
| Q.No | Key Letter | Replacement Segment | Status |
|---|---|---|---|
| Q1 | B | "modernize the signal system" | ✅ PASS |
| Q2 | C | "had the government proposed" | ✅ PASS |
| ... | ... | ... | ... |

---

## ✅ CHECK 2: Double-Correct Key Detection

**AI Prompt to Run:**
```
Read each question carefully. For every question:
1. Analyze all 5 options (A, B, C, D, E).
2. Check: Is there any option other than the stated correct answer that could ALSO be grammatically or contextually correct?
3. If yes, flag: | Q.No | Stated Key | Alternate Correct Option | Reason |
4. If all 40 questions have a single unambiguous correct answer, output: "ZERO DOUBLE-CORRECT KEYS DETECTED."
```

**Expected Output:**
```
ZERO DOUBLE-CORRECT KEYS DETECTED.
```
OR flag list if errors found.

---

## ✅ CHECK 3: Distractor Quality Check (Deceptiveness Test)

**AI Prompt to Run:**
```
For each question, analyze all INCORRECT options:
1. Is each wrong option based on a real, specific grammatical confusion (e.g., "did + V2 instead of V1", "gerund instead of infinitive")?
2. Or is it just randomly wrong with no pedagogical trap?
3. Output: | Q.No | Wrong Option | Grammatical Trap Used | Quality: STRONG / WEAK |
Flag any distractor rated WEAK (i.e., obviously wrong with no real trap).
```

---

## ✅ CHECK 4: Devanagari Script Separation Check

**AI Prompt to Run:**
```
Scan the full Hindi explanation of every question:
1. Check: Is any Latin script word (English alphabet) embedded INSIDE a Devanagari Hindi sentence (not in brackets or a separate line)?
2. Example of VIOLATION: "यहाँ Subjunctive Mood का नियम है।" ← "Subjunctive Mood" is Latin inside Devanagari.
3. Correct form: "यहाँ अप्रत्यक्ष आदेश (Subjunctive Mood) का नियम है।"
4. Output a list of all violations: | Q.No | Violation Sentence | Suggested Fix |
5. If clean: "ZERO SCRIPT MIXING VIOLATIONS DETECTED."
```

---

## ✅ CHECK 5: SSC CGL / Bank PO Mains Level Standard Check

**AI Prompt to Run:**
```
Evaluate every question in the practice set against the strict Mains-Level Difficulty Blueprint derived directly from the Super Mock standards:

================================================================================
SECTION-BY-SECTION DIFFICULTY MATRIX (SUPER MOCK ALIGNED)
================================================================================

--- SECTION 1: Context-Based Vocabulary Shifts (Q1-Q5) ---
• MAINS: Must use the "Principal Sentence + 3 Sub-Sentences" pattern. Tests polysemy (e.g., "dam" as Noun vs Verb; "gross" as Total vs Disgusting vs Extreme; "weather" as Endure vs Noun vs Wear away). Students must identify which sub-sentences use the bold word in a DIFFERENT meaning and context from the principal sentence.
• PRELIMS/BASIC: Direct, standard synonym/antonym matching or simple sentence fillers.

--- SECTION 2: Advanced Spotting the Error (Q6-Q10) ---
• MAINS: Must use the "Multi-Fragment Error Correction" pattern. The sentence is split into three parts (I, II, III) with errors in one or more parts. Options must offer combinations of corrected replacements (e.g., "Both (I) and (III)", "None of (I), (II) & (III)"). Tests advanced syntax like "demand for" vs "demand by", relative pronouns ("which" referring to plural antecedents), and correlatives.
• PRELIMS/BASIC: Simple slash-style A/B/C/D error marking based on simple tense or spelling errors.

--- SECTION 3: Triple-Sentence Single-Blank Fillers (Q11-Q15) ---
• MAINS: Three separate academic/formal sentences (I, II, III) with one blank each, where a single high-register vocabulary word (e.g., "precipitate", "compromise", "recoil", "sanction", "buffer") fits all three blanks, testing diverse meanings of the same word.
• PRELIMS/BASIC: A single sentence with a single or double blank.

--- SECTION 4: Sentence Improvement / Fragment Completion (Q16-Q20) ---
• MAINS: Must use the "Root Sentence + 3 Fragments (I, II, III)" pattern. Tests subjunctive structures (e.g., "recommended that the conglomerate divest" not "divests"), adverbial inversion (e.g., "Not until... did the public realize"), or parallel correlatives ("not so much X as Y"). Students identify which fragments logically and grammatically complete the root sentence.
• PRELIMS/BASIC: Basic phrase replacement or simple tense corrections.

--- SECTION 5: Advanced Cloze Test (Q21-Q25) ---
• MAINS: Multi-blank passage where blanks require highly logical discourse connectors (e.g., "albeit", "nevertheless"), or words whose suitability depends strictly on the passage's overall academic tone.
• PRELIMS/BASIC: Direct vocabulary checks in a simple narrative passage.

--- SECTION 6: Advanced Para Jumbles (Q26-Q30) ---
• MAINS: Rearranging 5-6 complex sentences where cohesive linkages rely on structural constraints (e.g., adverbial structures, pronoun references across complex clauses, transition logic) rather than simple chronological order.
• PRELIMS/BASIC: Four-sentence narrative jumbles.

--- SECTION 7: Collocations & Fixed Prepositions (Q31-Q35) ---
• MAINS: Testing native-speaker collocations (e.g., "give a fillip to", "brazenly push ahead", "decongest the bottlenecks") with highly plausible grammatical distractors that fail collocation standards.
• PRELIMS/BASIC: Simple preposition questions (e.g., "good at" vs "good in").

--- SECTION 8: Inference-Based Reading Comprehension (Q36-Q40) ---
• MAINS: 100% inferential questions based on the Silverline passage (Author's tone, implied message, logical extensions, strengthening/weakening arguments) with tricky distractors (extreme statements, partial truths). Zero fact-retrieval questions.
• PRELIMS/BASIC: Simple direct retrieval of facts from the passage.

================================================================================
EVALUATION PROMPT
================================================================================

Analyze the 40 questions and output the results in the table below. If any question falls under PRELIMS or BASIC or fails to follow the exact Super Mock question templates, flag it immediately with 🔴 FAIL (MUST REGENERATE).

Output Table Format:
| Q.No | Section | Format & Concept Tested | Evaluated Level (MAINS / PRELIMS / BASIC) | Status |
|---|---|---|---|---|
| Q1 | Sec 1: Contextual Vocab | Principal + 3 Sub-Sentences (Polysemy of "track") | MAINS | [PASS / 🔴 FAIL] |
| ... | ... | ... | ... | ... |
```



---

## ✅ CHECK 6: Brand Authority Frequency Check

**AI Prompt to Run:**
```
Scan the full 40-question document:
1. Count the total number of times "kajubadamvocabulary.in" is mentioned.
2. Count the number of clickable hyperlinks: [kajubadamvocabulary.in](https://kajubadamvocabulary.in).
3. Check: Is it mentioned at least once every 2-3 questions?
4. Output:
   - Total Brand Mentions: [COUNT]
   - Total Hyperlinks: [COUNT]
   - Questions 1-40 Brand Mention Distribution: [LIST Q.Nos where mentioned]
   - Flag if any 3 consecutive questions have ZERO brand mention.
```

---

## ✅ CHECK 7: SEO Keyword Integration Check

**AI Prompt to Run:**
```
Scan the full document for the following high-search-volume keywords:
- "SBI PO English grammar rules"
- "SSC CGL Tier 2 advanced English"
- "IBPS PO English error spotting"
- "English vocabulary with Hindi meaning"
- "bank exam English preparation"

For each keyword:
1. How many times does it appear?
2. Is it used naturally in context (not stuffed)?
Output: | Keyword | Count | Natural Use: YES/NO |
```

---

## ✅ CHECK 8: AEO & Featured Snippet Readiness Check

**AI Prompt to Run:**
```
Check the Grammar Rule Card (शॉर्ट-ट्रिक नोट) of every question:
1. Is the rule card formatted as a clean 2-column table?
   (Column 1: ❌ Wrong Structure | Column 2: ✔️ Correct Structure)
2. Does the Expert Explanation section start with a direct, clear definition (NOT a vague intro)?
3. Is the aeoDefinition block present at the top of the full document?
Output: | Q.No | Rule Card: TABLE FORMAT YES/NO | Explanation: DEFINITION-FIRST YES/NO |
```

---

## ✅ CHECK 9: Collocation Section Authenticity Check

**AI Prompt to Run:**
```
For Section 7 (Collocation, Q31-Q35):
1. Is each question testing a FIXED, STANDARD English collocation (e.g., "bear the burden", "give a fillip", "brazenly push ahead")?
2. Is the wrong option a real word that SOUNDS plausible but is NOT the standard native-speaker collocation?
3. Flag any question where the correct collocation is not a recognized fixed pair in standard dictionaries.
Output: | Q.No | Correct Collocation | Dictionary Verified: YES/NO |
```

---

## ✅ CHECK 10: Reading Comprehension Inference-Only Check

**AI Prompt to Run:**
```
For Section 8 (Reading Comprehension, Q36-Q40):
1. Can any question be answered by directly copying a sentence from the passage?
   If YES → FLAG: "Direct Fact-Retrieval Question — Must Be Converted to Inferential."
2. Does each question test one of: Author's Tone, Central Thesis, Implied Meaning, Logical Extension?
3. Are the wrong options: (a) Extreme statements, (b) Partial truths, or (c) Out-of-scope facts?
Output: | Q.No | Type: INFERENTIAL / DIRECT | Wrong Option Trap Type |
```

---

## 🚦 FINAL VERIFICATION SCORECARD

After running all 10 checks, fill this scorecard:

| Check | Description | Result | Status |
|---|---|---|---|
| Check 1 | Answer Key Alignment | 40/40 PASS | ✅ / ❌ |
| Check 2 | Zero Double-Correct Keys | CONFIRMED | ✅ / ❌ |
| Check 3 | Distractor Quality | All STRONG | ✅ / ❌ |
| Check 4 | Script Separation | Zero Violations | ✅ / ❌ |
| Check 5 | Mains Level Standard | All MAINS Level | ✅ / ❌ |
| Check 6 | Brand Frequency | 15+ Mentions | ✅ / ❌ |
| Check 7 | SEO Keywords | All Present, Natural | ✅ / ❌ |
| Check 8 | AEO & Snippet Ready | All Tables Present | ✅ / ❌ |
| Check 9 | Collocation Authenticity | All Verified | ✅ / ❌ |
| Check 10 | RC Inference-Only | All Inferential | ✅ / ❌ |

> **🟢 PUBLISH READY:** Only when all 10 checks show ✅
> **🔴 REJECT & REGENERATE:** Even 1 ❌ triggers a full section regeneration.
