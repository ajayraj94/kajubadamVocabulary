import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Contact | kajubadam Vocabulary",
    description:
        "Get in touch with kajubadam Vocabulary — we'd love to hear your feedback, suggestions, or questions.",
};

export default function ContactPage() {
    return (
        <LegalPageClient title="Contact">
            <h2>Get in Touch</h2>
            <p>
                Have a question, feedback, or need help? Drop us an email — we typically respond within 24 hours.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center my-6">
                <p className="text-[15px] text-gray-600 mb-3 font-medium">📧 Send us an email:</p>
                <a
                    href="mailto:contact@kajubadamvocabulary.in"
                    className="text-[20px] font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors"
                >
                    contact@kajubadamvocabulary.in
                </a>
            </div>

            <h2>Common Topics</h2>
            <ul>
                <li>
                    <strong>Report a bug:</strong> Describe what went wrong and on which
                    page. Screenshots help!
                </li>
                <li>
                    <strong>Suggest a feature:</strong> We're always improving. Tell
                    us what would make your learning better.
                </li>
                <li>
                    <strong>Payment issues:</strong> If you purchased but haven't received
                    access, include your transaction/email details.
                </li>
                <li>
                    <strong>Collaboration:</strong> Interested in contributing or
                    partnering? Reach out!
                </li>
            </ul>

            <h2>Feedback Matters</h2>
            <p>
                Kajubadam Vocabulary is built for learners like you. Your feedback
                directly shapes what we build next. Don't hesitate to reach out!
            </p>
        </LegalPageClient>
    );
}