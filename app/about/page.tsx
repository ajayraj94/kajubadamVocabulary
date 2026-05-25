import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "About | kajubadam Vocabulary",
    description:
        "Learn about kajubadam Vocabulary — your free platform to master English-Hindi vocabulary through immersive stories.",
};

export default function AboutPage() {
    return (
        <LegalPageClient title="About kajubadam Vocabulary">
            <h2>Our Mission</h2>
            <p>
                kajubadam Vocabulary is a free, bilingual (English-Hindi) vocabulary
                learning platform. We believe that the best way to learn vocabulary is
                through <strong>immersive stories</strong> — not boring word lists.
            </p>
            <p>
                Our platform covers <strong>11,252+ vocabulary items</strong> across:
            </p>
            <ul>
                <li><strong>Part 1 (5,062 vocab):</strong> Homonyms, Idioms, Phrasal Verbs, Prepositions, Proverbs — spread across 300+ stories</li>
                <li><strong>Part 2 (6,700 vocab):</strong> Advanced vocabulary organized in 67 batches with 48 stories each</li>
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

            <h2>Free Forever</h2>
            <p>
                kajubadam Vocabulary is and will remain free. No paywalls, no
                subscriptions, no ads. Built for learners, by learners.
            </p>
        </LegalPageClient>
    );
}