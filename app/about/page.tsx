import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "About | kajubadam Vocabulary",
    description:
        "Learn about kajubadam Vocabulary — master English-Hindi vocabulary through immersive bilingual stories. Try free sample stories + daily news vocab for free. Premium paid courses start at \u20B9299 (SSC CGL, Banking, UPSC).",
};

export default function AboutPage() {
    return (
        <LegalPageClient title="About kajubadam Vocabulary">
            <h2>Our Mission</h2>
            <p>
                kajubadam Vocabulary is a bilingual (English-Hindi) vocabulary
                learning platform. We believe that the best way to learn vocabulary is
                through <strong>immersive stories</strong> — not boring word lists.
            </p>
            <p>
                Our platform covers <strong>11,762+ vocabulary items</strong> across:
            </p>
            <ul>
                <li><strong>Part 1 (5,062 vocab — ₹299):</strong> Homonyms, Idioms, Phrasal Verbs, Prepositions, Proverbs — spread across 48 story sets</li>
                <li><strong>Part 2 (6,700 vocab — ₹399):</strong> Advanced vocabulary organized in 67 bilingual batches with interactive quizzes</li>
                <li><strong>Daily News:</strong> Current affairs-based English vocabulary with mock tests, fill-in-the-blanks, synonyms, antonyms, and comprehension</li>
            </ul>

            <h2>How It Works</h2>
            <ol>
                <li>
                    <strong>Read a story</strong> — Each story is packed with bold
                    vocabulary words and their Hindi meanings in brackets.
                </li>
                <li>
                    <strong>Take the quiz</strong> — Test yourself with English-to-Hindi
                    and Hindi-to-English multiple-choice questions.
                </li>
                <li>
                    <strong>Track progress</strong> — Mark stories as mastered and watch
                    your vocabulary grow.
                </li>
                <li>
                    <strong>Daily News Practice</strong> — Read editorials with parallel
                    Hindi translations and practice exam-style questions.
                </li>
            </ol>

            <h2>Why "kajubadam"?</h2>
            <p>
                "Kaju" (cashew) and "badam" (almond) — two nuts that
                are small but packed with nutrition. Just like vocabulary words: small
                units that nourish your language skills. The name reflects our Indian
                roots and the playful, approachable spirit of our platform.
            </p>

            <h2>Free Samples (Try Before You Buy)</h2>
            <p>
                <strong>2 complete sample stories:</strong> Saga 1-01 (Part 1) and Saga 2-01 (Part 2) —
                experience the quality before purchasing. Plus <strong>50 free SSC Error Detection PYQs</strong>
                and <strong>50 free Sentence Improvement PYQs</strong> with bilingual explanations on page 1.
            </p>

            <h2>Daily News Vocabulary — Free (Updated Daily)</h2>
            <p>
                The <strong>Daily News Vocabulary</strong> section is completely free — 
                40+ exam-style questions per article with bilingual Hindi translations. 
                Updated daily from current affairs editorials. No signup needed.
            </p>

            <h2>Premium Courses: One-Time Purchase, Lifetime Access</h2>
            <p>
                The complete <strong>11,762+ word curriculum</strong> includes paid courses 
                starting at just <strong>₹299</strong> (one-time, lifetime access):
            </p>
            <ul>
                <li><strong>Part 1: Core Vocabulary (₹299)</strong> — 5,062 words: Homonyms, Idioms, Phrasal Verbs, Prepositions, Proverbs across 48 story sets</li>
                <li><strong>Part 2: Story-Based Advanced (₹399)</strong> — 6,700 advanced exam words across 67 bilingual batches</li>
                <li><strong>Bundle Part 1 + Part 2 (₹599)</strong> — Save ₹99 on the full curriculum</li>
                <li><strong>SSC Error Detection 716 PYQ (₹149)</strong> — Fully solved with bilingual explanations</li>
                <li><strong>SSC Sentence Improvement 790 PYQ (₹149)</strong> — Fully solved with bilingual explanations</li>
            </ul>
            <p>
                No subscriptions, no recurring fees, no hidden charges. Pay once, learn forever.
            </p>
        </LegalPageClient>
    );
}