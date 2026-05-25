import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Privacy Policy | kajubadam Vocabulary",
    description:
        "Privacy Policy for kajubadam Vocabulary — Learn how we handle your data while you master English-Hindi vocabulary.",
};

export default function PrivacyPage() {
    return (
        <LegalPageClient title="Privacy Policy">
            <p className="text-sm text-gray-400 mb-6">Last updated: May 22, 2026</p>

            <h2>1. Information We Collect</h2>
            <p>
                <strong>We collect almost nothing.</strong> kajubadam Vocabulary is a
                learning-first website. We do not require accounts, emails, or personal
                information to use the site.
            </p>
            <p>The only data stored is:</p>
            <ul>
                <li>
                    <strong>Local Storage:</strong> Your learning progress (mastered
                    stories, read news articles, quiz scores) is saved in your
                    browser's local storage. This data never leaves your device.
                </li>
                <li>
                    <strong>Session Storage:</strong> Your active tab preference is
                    temporarily saved for smooth back-navigation.
                </li>
            </ul>

            <h2>2. How We Use Information</h2>
            <p>
                Since all data stays in your browser, we do not collect, process, or
                share any personal information. Your progress data is yours alone.
            </p>

            <h2>3. Cookies</h2>
            <p>
                We do not use tracking cookies. The only cookies that may be set are
                essential session cookies by Next.js for basic functionality.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
                We do not integrate any third-party analytics, advertising networks, or
                tracking services. If this changes in the future, this policy will be
                updated accordingly.
            </p>

            <h2>5. Children's Privacy</h2>
            <p>
                kajubadam Vocabulary is an educational platform suitable for all ages.
                We do not knowingly collect any personal information from children under
                13.
            </p>

            <h2>6. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Changes will be
                posted on this page with an updated date.
            </p>

            <h2>7. Contact</h2>
            <p>
                If you have any questions about this Privacy Policy, visit our{" "}
                <a href="/contact">Contact page</a>.
            </p>
        </LegalPageClient>
    );
}