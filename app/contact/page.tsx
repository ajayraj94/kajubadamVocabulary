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
            <h2>We'd Love to Hear From You!</h2>
            <p>
                Whether you have feedback, found a bug, want to suggest a feature, or
                just want to say hello — we're all ears.
            </p>

            <h2>Email</h2>
            <p>
                📧{" "}
                <a href="mailto:ajaykrc3737@gmail.com">
                    ajaykrc3737@gmail.com
                </a>
            </p>
            <p className="text-sm text-gray-500 mt-1">
                We typically respond within 24-48 hours.
            </p>

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
                    <strong>Content errors:</strong> If you spot a mistake in a story,
                    quiz, or translation — please let us know.
                </li>
                <li>
                    <strong>Collaboration:</strong> Interested in contributing content or
                    partnering? Reach out!
                </li>
            </ul>

            <h2>Feedback Matters</h2>
            <p>
                kajubadam Vocabulary is built for learners like you. Your feedback
                directly shapes what we build next. Don't hesitate to reach out!
            </p>
        </LegalPageClient>
    );
}