// ── Sub-Posts Data for All Sections ──
// Maps grouped topics in the roadmap to their individual sub-posts.
// Used by the roadmap page to show ✅/❌ sub-posts under expandable topics.

export interface SubPostInfo {
    serialNumber: number;
    label: string;
}

export interface SubPostGroup {
    name: string;       // e.g., "Look", "Animals & Birds"
    serialStart: number;
    serialEnd: number;
    posts: SubPostInfo[];
}

// ═══════════════════════════════════════════════
// Part 1: Phrasal Verbs by Verb Family (Posts 1–80)
// ═══════════════════════════════════════════════

export const verbFamilies: SubPostGroup[] = [
    {
        name: "Look", serialStart: 1, serialEnd: 4,
        posts: [
            { serialNumber: 1, label: "Basic list with stories & Hindi meanings" },
            { serialNumber: 2, label: "Confusing cases with English-Hindi examples" },
            { serialNumber: 3, label: "Previous Year SSC CGL/Bank Questions" },
            { serialNumber: 4, label: "Interactive Quiz (Bilingual)" },
        ],
    },
    {
        name: "Get", serialStart: 5, serialEnd: 8,
        posts: [
            { serialNumber: 5, label: "Top 15 with Hindi meanings & stories" },
            { serialNumber: 6, label: "Advanced (Get away, Get over, Get along)" },
            { serialNumber: 7, label: "Bank PO & SSC PYQs (Bilingual)" },
            { serialNumber: 8, label: "Fill in the Blanks Quiz" },
        ],
    },
    {
        name: "Take", serialStart: 9, serialEnd: 12,
        posts: [
            { serialNumber: 9, label: "Common phrasal verbs with Hindi meanings" },
            { serialNumber: 10, label: "Confusing: Take after vs Take to vs Take off" },
            { serialNumber: 11, label: "Previous Year Questions for Competitive Exams" },
            { serialNumber: 12, label: "Practice Exercise & Matching Quiz" },
        ],
    },
    {
        name: "Put", serialStart: 13, serialEnd: 16,
        posts: [
            { serialNumber: 13, label: "Important (Put on, Put off, Put up with) with Hindi" },
            { serialNumber: 14, label: "Master confusing meanings with Hindi translation" },
            { serialNumber: 15, label: "SSC CGL & Bank Exams PYQs with Solutions" },
            { serialNumber: 16, label: "Interactive Bilingual Quiz" },
        ],
    },
    {
        name: "Bring", serialStart: 17, serialEnd: 20,
        posts: [
            { serialNumber: 17, label: "Basic (Bring up, Bring out, Bring about) with Hindi" },
            { serialNumber: 18, label: "Advanced with English-Hindi examples" },
            { serialNumber: 19, label: "Expected Exam Questions with Hindi translation" },
            { serialNumber: 20, label: "Fill-in-the-blank Quiz (Active Recall)" },
        ],
    },
    {
        name: "Call", serialStart: 21, serialEnd: 24,
        posts: [
            { serialNumber: 21, label: "Important (Call off, Call on, Call for) with Hindi" },
            { serialNumber: 22, label: "Master with Short Stories and Hindi Translation" },
            { serialNumber: 23, label: "Previous Year SSC & Banking Questions" },
            { serialNumber: 24, label: "Practice Test with Explanations" },
        ],
    },
    {
        name: "Run", serialStart: 25, serialEnd: 28,
        posts: [
            { serialNumber: 25, label: "Common (Run out, Run over, Run into) with Hindi" },
            { serialNumber: 26, label: "Advanced with English-Hindi examples" },
            { serialNumber: 27, label: "PYQs and Error Spotting Rules" },
            { serialNumber: 28, label: "Interactive Matching Quiz" },
        ],
    },
    {
        name: "Set", serialStart: 29, serialEnd: 32,
        posts: [
            { serialNumber: 29, label: "Basic (Set up, Set in, Set off) with Hindi" },
            { serialNumber: 30, label: "Confusing through Hindi Stories" },
            { serialNumber: 31, label: "TCS Pattern PYQs (Bilingual Solutions)" },
            { serialNumber: 32, label: "Weekly Quiz & Review" },
        ],
    },
    {
        name: "Break", serialStart: 33, serialEnd: 36,
        posts: [
            { serialNumber: 33, label: "Key (Break down, Break into, Break out) with Hindi" },
            { serialNumber: 34, label: "Advanced & Idioms with Hindi meanings" },
            { serialNumber: 35, label: "Most Repeated SSC & Bank PYQs" },
            { serialNumber: 36, label: "Practice Test with Bilingual Answers" },
        ],
    },
    {
        name: "Make", serialStart: 37, serialEnd: 40,
        posts: [
            { serialNumber: 37, label: "Basic (Make out, Make up, Make for) with Hindi" },
            { serialNumber: 38, label: "Advanced with English-Hindi examples" },
            { serialNumber: 39, label: "Important Questions from Recent Exams" },
            { serialNumber: 40, label: "Interactive Grammar Quiz" },
        ],
    },
    {
        name: "Turn", serialStart: 41, serialEnd: 44,
        posts: [
            { serialNumber: 41, label: "Basic (Turn down, Turn up, Turn out) with Hindi" },
            { serialNumber: 42, label: "Advanced uses with examples" },
            { serialNumber: 43, label: "PYQs for SSC & Bank Exams" },
            { serialNumber: 44, label: "Practice Quiz" },
        ],
    },
    {
        name: "Keep", serialStart: 45, serialEnd: 48,
        posts: [
            { serialNumber: 45, label: "Basic (Keep up, Keep off, Keep on) with Hindi" },
            { serialNumber: 46, label: "Advanced meanings and examples" },
            { serialNumber: 47, label: "Previous Year Questions" },
            { serialNumber: 48, label: "Practice Quiz" },
        ],
    },
    {
        name: "Come", serialStart: 49, serialEnd: 52,
        posts: [
            { serialNumber: 49, label: "Basic (Come across, Come by) with Hindi" },
            { serialNumber: 50, label: "Advanced (Come out, Come up with)" },
            { serialNumber: 51, label: "PYQs for Competitive Exams" },
            { serialNumber: 52, label: "Practice Quiz" },
        ],
    },
    {
        name: "Give", serialStart: 53, serialEnd: 56,
        posts: [
            { serialNumber: 53, label: "Basic (Give up, Give in, Give away) with Hindi" },
            { serialNumber: 54, label: "Advanced (Give out, Give off)" },
            { serialNumber: 55, label: "PYQs for SSC & Banking" },
            { serialNumber: 56, label: "Practice Quiz" },
        ],
    },
    {
        name: "Fall", serialStart: 57, serialEnd: 60,
        posts: [
            { serialNumber: 57, label: "Basic (Fall flat, Fall out) with Hindi" },
            { serialNumber: 58, label: "Advanced (Fall back, Fall behind)" },
            { serialNumber: 59, label: "PYQs for Competitive Exams" },
            { serialNumber: 60, label: "Practice Quiz" },
        ],
    },
    {
        name: "Carry", serialStart: 61, serialEnd: 64,
        posts: [
            { serialNumber: 61, label: "Basic (Carry on, Carry out) with Hindi" },
            { serialNumber: 62, label: "Advanced (Carry away, Carry through)" },
            { serialNumber: 63, label: "Expected Exam Questions" },
            { serialNumber: 64, label: "Practice Quiz" },
        ],
    },
    {
        name: "Go", serialStart: 65, serialEnd: 68,
        posts: [
            { serialNumber: 65, label: "Basic (Go through, Go off) with Hindi" },
            { serialNumber: 66, label: "Advanced (Go on, Go up)" },
            { serialNumber: 67, label: "PYQs for SSC & Bank Exams" },
            { serialNumber: 68, label: "Practice Quiz" },
        ],
    },
    {
        name: "Pass", serialStart: 69, serialEnd: 72,
        posts: [
            { serialNumber: 69, label: "Basic (Pass away, Pass out) with Hindi" },
            { serialNumber: 70, label: "Advanced (Pass off, Pass by)" },
            { serialNumber: 71, label: "Previous Year Questions" },
            { serialNumber: 72, label: "Practice Quiz" },
        ],
    },
    {
        name: "Stand", serialStart: 73, serialEnd: 76,
        posts: [
            { serialNumber: 73, label: "Basic (Stand by, Stand out) with Hindi" },
            { serialNumber: 74, label: "Advanced (Stand for, Stand up to)" },
            { serialNumber: 75, label: "PYQs for SSC Exams" },
            { serialNumber: 76, label: "Practice Quiz" },
        ],
    },
    {
        name: "Hold", serialStart: 77, serialEnd: 80,
        posts: [
            { serialNumber: 77, label: "Basic (Hold on, Hold up) with Hindi" },
            { serialNumber: 78, label: "Advanced (Hold back, Hold out)" },
            { serialNumber: 79, label: "Previous Year Questions" },
            { serialNumber: 80, label: "Practice Quiz" },
        ],
    },
];

// ═══════════════════════════════════════════════
// Part 2: Theme-Based Idioms (Posts 81–130)
// ═══════════════════════════════════════════════

export const themeIdiomPosts: SubPostGroup[] = [
    { name: "Animals & Birds", serialStart: 81, serialEnd: 82, posts: [
        { serialNumber: 81, label: "30 Animal Idioms with Hindi Meanings, Origin Stories & Examples" },
        { serialNumber: 82, label: "Mock Test: Animal Idioms for SSC and Banking Exams (Bilingual)" },
    ]},
    { name: "Colors", serialStart: 83, serialEnd: 84, posts: [
        { serialNumber: 83, label: "25 Color-Based Idioms with Hindi Meanings (Red, Blue, Green, etc.)" },
        { serialNumber: 84, label: "MCQ Quiz: Color Idioms for Competitive Exams with Hindi" },
    ]},
    { name: "Body Parts", serialStart: 85, serialEnd: 86, posts: [
        { serialNumber: 85, label: "Top 35 Body Parts Idioms (Hand, Eye, Foot, Head) with Hindi" },
        { serialNumber: 86, label: "Fill in the Blanks: Body Parts Idioms Practice Exercise" },
    ]},
    { name: "Food & Eating", serialStart: 87, serialEnd: 88, posts: [
        { serialNumber: 87, label: "Food-Related Idioms with Hindi Meanings & Contextual Examples" },
        { serialNumber: 88, label: "Interactive Practice Quiz: Food Idioms for SSC CGL & IBPS PO" },
    ]},
    { name: "Time & Clocks", serialStart: 89, serialEnd: 90, posts: [
        { serialNumber: 89, label: "Idioms about Time with Hindi Meanings & Real-Life Situations" },
        { serialNumber: 90, label: "Exam Practice Questions: Time Idioms with Bilingual Explanations" },
    ]},
    { name: "Money & Finance", serialStart: 91, serialEnd: 92, posts: [
        { serialNumber: 91, label: "Money & Wealth Idioms with Hindi Meanings" },
        { serialNumber: 92, label: "Spot the Error: Money Idioms in Bank Exams (Hindi)" },
    ]},
    { name: "Weather & Nature", serialStart: 93, serialEnd: 94, posts: [
        { serialNumber: 93, label: "Weather Idioms with Hindi Meanings (Under the weather, etc.)" },
        { serialNumber: 94, label: "Match the Following: Weather Idioms Quiz with Hindi" },
    ]},
    { name: "Numbers & Math", serialStart: 95, serialEnd: 96, posts: [
        { serialNumber: 95, label: "Numbers & Math Idioms (At sixes and sevens, etc.) with Hindi" },
        { serialNumber: 96, label: "Practice Quiz: Numbers & Math Idioms" },
    ]},
    { name: "Clothes & Fashion", serialStart: 97, serialEnd: 98, posts: [
        { serialNumber: 97, label: "Clothes & Fashion Idioms (In my shoes, Keep your shirt on)" },
        { serialNumber: 98, label: "Practice Quiz: Clothes & Fashion Idioms" },
    ]},
    { name: "Relationships", serialStart: 99, serialEnd: 100, posts: [
        { serialNumber: 99, label: "Relationship Idioms (Birds of a feather, Bury the hatchet)" },
        { serialNumber: 100, label: "Practice Quiz: Relationship Idioms" },
    ]},
    { name: "Success & Failure", serialStart: 101, serialEnd: 102, posts: [
        { serialNumber: 101, label: "Success & Failure Idioms (Hit the jackpot, Go down in flames)" },
        { serialNumber: 102, label: "Practice Quiz: Success & Failure Idioms" },
    ]},
    { name: "Anger & Emotions", serialStart: 103, serialEnd: 104, posts: [
        { serialNumber: 103, label: "Anger & Emotion Idioms (Fly off the handle, On cloud nine)" },
        { serialNumber: 104, label: "Practice Quiz: Anger & Emotions Idioms" },
    ]},
    { name: "Health & Sickness", serialStart: 105, serialEnd: 106, posts: [
        { serialNumber: 105, label: "Health Idioms (Fit as a fiddle, Back on your feet) with Hindi" },
        { serialNumber: 106, label: "Practice Quiz: Health & Sickness Idioms" },
    ]},
    { name: "Travel & Motion", serialStart: 107, serialEnd: 108, posts: [
        { serialNumber: 107, label: "Travel Idioms (Hit the road, In the same boat) with Hindi" },
        { serialNumber: 108, label: "Practice Quiz: Travel & Motion Idioms" },
    ]},
    { name: "Work & Office", serialStart: 109, serialEnd: 110, posts: [
        { serialNumber: 109, label: "Work Idioms (Burn the midnight oil, Call it a day) with Hindi" },
        { serialNumber: 110, label: "Practice Quiz: Work & Office Idioms" },
    ]},
    { name: "Music & Art", serialStart: 111, serialEnd: 112, posts: [
        { serialNumber: 111, label: "Music & Art Idioms (Blow your own trumpet, Face the music)" },
        { serialNumber: 112, label: "Practice Quiz: Music & Art Idioms" },
    ]},
    { name: "Books & Education", serialStart: 113, serialEnd: 114, posts: [
        { serialNumber: 113, label: "Education Idioms (Read between the lines, Bookworm) with Hindi" },
        { serialNumber: 114, label: "Practice Quiz: Books & Education Idioms" },
    ]},
    { name: "Sports & Games", serialStart: 115, serialEnd: 116, posts: [
        { serialNumber: 115, label: "Sports Idioms (The ball is in your court) with Hindi" },
        { serialNumber: 116, label: "Practice Quiz: Sports & Games Idioms" },
    ]},
    { name: "Fire & Water", serialStart: 117, serialEnd: 118, posts: [
        { serialNumber: 117, label: "Fire & Water Idioms (Play with fire, In hot water) with Hindi" },
        { serialNumber: 118, label: "Practice Quiz: Fire & Water Idioms" },
    ]},
    { name: "Household Objects", serialStart: 119, serialEnd: 120, posts: [
        { serialNumber: 119, label: "Household Idioms (Bring to the table, Spill the beans)" },
        { serialNumber: 120, label: "Practice Quiz: Household Objects Idioms" },
    ]},
    { name: "Tools & Weapons", serialStart: 121, serialEnd: 122, posts: [
        { serialNumber: 121, label: "Tools Idioms (Double-edged sword, Hit the nail on head)" },
        { serialNumber: 122, label: "Practice Quiz: Tools & Weapons Idioms" },
    ]},
    { name: "Sleep & Dreams", serialStart: 123, serialEnd: 124, posts: [
        { serialNumber: 123, label: "Sleep Idioms (Hit the sack, Lose sleep over) with Hindi" },
        { serialNumber: 124, label: "Practice Quiz: Sleep & Dreams Idioms" },
    ]},
    { name: "Law & Justice", serialStart: 125, serialEnd: 126, posts: [
        { serialNumber: 125, label: "Law Idioms (Behind bars, Let off the hook) with Hindi" },
        { serialNumber: 126, label: "Practice Quiz: Law & Justice Idioms" },
    ]},
    { name: "Geography & Earth", serialStart: 127, serialEnd: 128, posts: [
        { serialNumber: 127, label: "Geography Idioms (Move mountains, Down to earth) with Hindi" },
        { serialNumber: 128, label: "Practice Quiz: Geography & Earth Idioms" },
    ]},
    { name: "War & Peace", serialStart: 129, serialEnd: 130, posts: [
        { serialNumber: 129, label: "War & Peace Idioms (Bite the bullet, Bury the hatchet)" },
        { serialNumber: 130, label: "Practice Quiz: War & Peace Idioms" },
    ]},
];

// ═══════════════════════════════════════════════
// Part 3: SSC Previous Year Idioms (Posts 131–170)
// ═══════════════════════════════════════════════

export const sscPyqPosts: SubPostGroup[] = [
    {
        name: "SSC CGL 2018-2026", serialStart: 131, serialEnd: 142,
        posts: [
            { serialNumber: 131, label: "SSC CGL 2026 Tier-1 Idioms (All Shifts) with Hindi" },
            { serialNumber: 132, label: "SSC CGL 2026 Tier-2 Idioms with Bilingual Explanations" },
            { serialNumber: 133, label: "SSC CGL 2025 Tier-1 Idioms with Hindi Meanings" },
            { serialNumber: 134, label: "SSC CGL 2025 Tier-2 Idioms with Bilingual Explanations" },
            { serialNumber: 135, label: "Most Repeated Idioms SSC CGL 2024 Tier-1" },
            { serialNumber: 136, label: "SSC CGL 2024 Tier-2 Idioms & Phrases (Bilingual)" },
            { serialNumber: 137, label: "All Idioms SSC CGL 2023 Tier-1 with Hindi" },
            { serialNumber: 138, label: "SSC CGL 2023 Tier-2 Idioms & Phrases with Answers" },
            { serialNumber: 139, label: "Year-wise: SSC CGL 2022 Idioms (Bilingual)" },
            { serialNumber: 140, label: "Year-wise: SSC CGL 2021 Idioms with Hindi" },
            { serialNumber: 141, label: "Year-wise: SSC CGL 2020 Idioms (Detailed)" },
            { serialNumber: 142, label: "Year-wise: SSC CGL 2018-19 Idioms with Hindi" },
        ],
    },
    {
        name: "SSC CHSL", serialStart: 143, serialEnd: 149,
        posts: [
            { serialNumber: 143, label: "SSC CHSL 2026 Idioms (All Shifts) in Hindi" },
            { serialNumber: 144, label: "SSC CHSL 2025 Idioms with Bilingual Meanings" },
            { serialNumber: 145, label: "SSC CHSL 2024 Idioms with Hindi Meaning" },
            { serialNumber: 146, label: "SSC CHSL 2023 Idioms & Phrases with Explanations" },
            { serialNumber: 147, label: "SSC CHSL 2022 PYQs Idioms with Hindi" },
            { serialNumber: 148, label: "SSC CHSL 2021 PYQs Idioms with Solutions" },
            { serialNumber: 149, label: "SSC CHSL 2020 PYQs Idioms with Hindi Explanations" },
        ],
    },
    {
        name: "SSC MTS", serialStart: 150, serialEnd: 156,
        posts: [
            { serialNumber: 150, label: "SSC MTS 2026 Idioms with Hindi Meanings" },
            { serialNumber: 151, label: "SSC MTS 2025 Idioms with Bilingual Explanations" },
            { serialNumber: 152, label: "SSC MTS 2024 Idioms with Detailed Hindi" },
            { serialNumber: 153, label: "SSC MTS 2023 Idioms & Phrases with Examples" },
            { serialNumber: 154, label: "SSC MTS 2022 PYQs Idioms with Bilingual" },
            { serialNumber: 155, label: "SSC MTS 2021 PYQs Idioms with Hindi" },
            { serialNumber: 156, label: "SSC MTS 2020 PYQs Idioms with Explanations" },
        ],
    },
    {
        name: "SSC CPO", serialStart: 157, serialEnd: 163,
        posts: [
            { serialNumber: 157, label: "SSC CPO 2026 Hard Idioms with Hindi Meanings" },
            { serialNumber: 158, label: "SSC CPO 2025 Idioms with Bilingual" },
            { serialNumber: 159, label: "SSC CPO 2024 Idioms with Detailed Solutions" },
            { serialNumber: 160, label: "SSC CPO 2023 Idioms & Phrases with Hindi" },
            { serialNumber: 161, label: "SSC CPO 2022 PYQs with Detailed Analysis" },
            { serialNumber: 162, label: "SSC CPO 2021 PYQs with Bilingual" },
            { serialNumber: 163, label: "SSC CPO 2020 PYQs with Hindi Meanings" },
        ],
    },
    {
        name: "Selected & Repeated", serialStart: 164, serialEnd: 170,
        posts: [
            { serialNumber: 164, label: "SSC Selection Post: Most Expected Idioms" },
            { serialNumber: 165, label: "SSC Stenographer: Repeated Idioms" },
            { serialNumber: 166, label: "Top 50 Repeated TCS Pattern Idioms" },
            { serialNumber: 167, label: "100 Hardest Idioms with Hindi Memory Tricks" },
            { serialNumber: 168, label: "One-word Meanings of 50 Confusing Idioms" },
            { serialNumber: 169, label: "Sentence Improvement: Idiom PYQs" },
            { serialNumber: 170, label: "Fill-in-the-blank Idiom Questions Quiz" },
        ],
    },
];

// ═══════════════════════════════════════════════
// Part 4: Bank, Defense & State Exams (Posts 171–210)
// ═══════════════════════════════════════════════

export const bankDefensePosts: SubPostGroup[] = [
    {
        name: "SBI PO & Clerk", serialStart: 171, serialEnd: 180,
        posts: [
            { serialNumber: 171, label: "New Pattern Idioms in SBI PO Mains with Hindi" },
            { serialNumber: 172, label: "High-Level Idioms SBI PO Prelims (Bilingual)" },
            { serialNumber: 173, label: "SBI Clerk Mains: Last 5 Years Analysis" },
            { serialNumber: 174, label: "SBI Clerk Prelims Expected Idioms" },
            { serialNumber: 175, label: "Sentences Starter Idioms for SBI PO" },
            { serialNumber: 176, label: "Double Fillers with Idioms in SBI Exams" },
            { serialNumber: 177, label: "Matching Columns Idiom Questions SBI PO" },
            { serialNumber: 178, label: "Cloze Test with Idioms in SBI Exams" },
            { serialNumber: 179, label: "Important Idioms for SBI with Sentences" },
            { serialNumber: 180, label: "Sectional Mock Test: Idioms for SBI" },
        ],
    },
    {
        name: "IBPS PO & Clerk", serialStart: 181, serialEnd: 190,
        posts: [
            { serialNumber: 181, label: "Top 30 High-Yield Idioms IBPS PO Mains" },
            { serialNumber: 182, label: "Important Idioms IBPS PO Prelims (Bilingual)" },
            { serialNumber: 183, label: "IBPS Clerk Mains Idioms with Hindi" },
            { serialNumber: 184, label: "Cloze Test & Fillers: IBPS Clerk Prelims" },
            { serialNumber: 185, label: "Phrase Replacement in IBPS PO" },
            { serialNumber: 186, label: "Confusing Idioms in IBPS Exams (Hindi)" },
            { serialNumber: 187, label: "Financial & Business Idioms for IBPS" },
            { serialNumber: 188, label: "Phrase Usage Questions in IBPS (Bilingual)" },
            { serialNumber: 189, label: "Important Idioms for IBPS with Hindi" },
            { serialNumber: 190, label: "Interactive Mock Test: IBPS Idioms" },
        ],
    },
    {
        name: "RBI Grade B & LIC", serialStart: 191, serialEnd: 198,
        posts: [
            { serialNumber: 191, label: "High-Level Phrase Idioms RBI Grade B" },
            { serialNumber: 192, label: "Idioms & Phrasal Verbs RBI Assistant" },
            { serialNumber: 193, label: "Expected Idioms LIC AAO Mains" },
            { serialNumber: 194, label: "Phrase Replacement RBI Grade B" },
            { serialNumber: 195, label: "RBI Assistant Mains Expected Idioms" },
            { serialNumber: 196, label: "Financial Idioms for RBI with Hindi" },
            { serialNumber: 197, label: "Cloze Test Idioms RBI & LIC Exams" },
            { serialNumber: 198, label: "Mock Test: High-Level Idioms RBI & LIC" },
        ],
    },
    {
        name: "Defense Exams", serialStart: 199, serialEnd: 206,
        posts: [
            { serialNumber: 199, label: "Expected Idioms for NDA English (Bilingual)" },
            { serialNumber: 200, label: "Repeated Idioms in NDA PYQs with Hindi" },
            { serialNumber: 201, label: "Important Idioms for CDS English" },
            { serialNumber: 202, label: "CDS PYQs Idioms with Hindi Explanations" },
            { serialNumber: 203, label: "Hard Idioms for CAPF English Descriptive" },
            { serialNumber: 204, label: "Idioms for Airforce & Navy Exams (Hindi)" },
            { serialNumber: 205, label: "Error Spotting Idioms: NDA & CDS" },
            { serialNumber: 206, label: "Fill Blanks Idioms: CDS & NDA Practice" },
        ],
    },
    {
        name: "State PCS", serialStart: 207, serialEnd: 210,
        posts: [
            { serialNumber: 207, label: "Important Idioms for State PCS (UPPSC, BPSC)" },
            { serialNumber: 208, label: "PYQs Idioms in State Civil Services (Bilingual)" },
            { serialNumber: 209, label: "Descriptive English Idioms for UPSC Mains" },
            { serialNumber: 210, label: "Idioms with Hindi Equivalents: State Masterlist" },
        ],
    },
];

// ═══════════════════════════════════════════════
// Unified Lookup
// ═══════════════════════════════════════════════

const allGroups: SubPostGroup[] = [
    ...verbFamilies,
    ...themeIdiomPosts,
    ...sscPyqPosts,
    ...bankDefensePosts,
];

/**
 * Find sub-posts for a given topic based on its serial range.
 * Returns ALL groups whose serial range falls within the given range.
 * This handles compound topics like "Turn (4), Keep (4), Come (4), Give (4)"
 * which span multiple groups (Turn=41-44, Keep=45-48, etc.).
 */
export function findSubPostsBySerial(
    serialStart: number,
    serialEnd: number
): SubPostGroup[] {
    return allGroups.filter(
        (g) => g.serialStart >= serialStart && g.serialEnd <= serialEnd
    );
}

/**
 * Find sub-posts by matching the start serial.
 * Used for partial matches (e.g., checking if any sub-posts exist for a serial range).
 */
export function hasSubPosts(serialStart: number, serialEnd: number): boolean {
    return allGroups.some(
        (g) => g.serialStart <= serialEnd && g.serialEnd >= serialStart
    );
}
