import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Disclaimer | kajubadam Vocabulary",
    description:
        "Disclaimer for kajubadam Vocabulary — understand the limitations and scope of our educational content.",
};

export default function DisclaimerPage() {
    return (
        <LegalPageClient title="Disclaimer">
            <p className="text-sm text-gray-400 mb-6">Last updated: May 22, 2026</p>

            <h2>Educational Purpose Only</h2>
            <p>
                All content on kajubadam Vocabulary is provided for{" "}
                <strong>educational and informational purposes only</strong>. While we
                strive for accuracy, vocabulary meanings, translations, and usage
                examples may not be exhaustive or perfectly precise in every context.
            </p>

            <h2>Not Exam-Specific</h2>
            <p>
                Our quizzes, mock tests, and daily news exercises are designed for
                general vocabulary improvement. They are <strong>not</strong> official
                preparation material for any specific competitive exam (SSC, UPSC, Bank
                PO, etc.). Exam patterns and syllabi change; always refer to official
                sources.
            </p>

            <h2>Translation Limitations</h2>
            <p>
                Hindi translations provided alongside English vocabulary are
                contextual. A single English word may have multiple Hindi meanings
                depending on usage. Our translations represent the most common or
                contextually relevant meaning, not every possible translation.
            </p>

            <h2>No Professional Advice</h2>
            <p>
                Nothing on this website constitutes professional educational, career, or
                legal advice. For specific guidance, consult qualified professionals in
                the relevant field.
            </p>

            <h2>Content Accuracy</h2>
            <p>
                We make reasonable efforts to ensure content accuracy, but errors may
                occur. If you find a mistake, please{" "}
                <a href="/contact">let us know</a> — we'll fix it promptly.
            </p>

            <h2>External Links</h2>
            <p>
                This website may contain links to external sites. We are not responsible
                for the content, accuracy, or practices of any third-party websites.
            </p>

            <h2>Fair Use</h2>
            <p>
                Daily news content is sourced from publicly available news articles and
                used for educational purposes under fair use principles. All editorial
                content is original work created for vocabulary learning.
            </p>
        </LegalPageClient>
    );
}