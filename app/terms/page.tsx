import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Terms of Service | kajubadam Vocabulary",
    description:
        "Terms of Service for kajubadam Vocabulary — the rules and guidelines for using our free vocabulary learning platform.",
};

export default function TermsPage() {
    return (
        <LegalPageClient title="Terms of Service">
            <p className="text-sm text-gray-400 mb-6">Last updated: May 22, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing and using kajubadam Vocabulary ("the Service"),
                you agree to be bound by these Terms of Service. If you do not agree,
                please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
                kajubadam Vocabulary is a free educational platform providing bilingual
                (English-Hindi) vocabulary learning through stories, quizzes, and daily
                news exercises. The Service is provided "as is" without any
                warranties.
            </p>

            <h2>3. User Conduct</h2>
            <p>You agree to use the Service only for lawful, educational purposes. You may not:</p>
            <ul>
                <li>Attempt to disrupt, hack, or overload the Service</li>
                <li>Scrape, copy, or redistribute our content without permission</li>
                <li>Use the Service for any commercial purpose without consent</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
                All content on kajubadam Vocabulary — including stories, quizzes,
                translations, code, design, and branding — is the intellectual property
                of the platform unless otherwise stated. Unauthorized reproduction or
                distribution is prohibited.
            </p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>
                The Service is provided on an "AS IS" and "AS
                AVAILABLE" basis. We make no guarantees about accuracy,
                availability, or fitness for a particular purpose. Educational content
                may contain errors — we appreciate corrections.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
                kajubadam Vocabulary and its creators shall not be liable for any
                damages arising from the use or inability to use the Service. This
                includes but is not limited to data loss, learning outcomes, or exam
                results.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
                We reserve the right to modify these Terms at any time. Continued use of
                the Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2>8. Contact</h2>
            <p>
                For questions about these Terms, visit our{" "}
                <a href="/contact">Contact page</a>.
            </p>
        </LegalPageClient>
    );
}