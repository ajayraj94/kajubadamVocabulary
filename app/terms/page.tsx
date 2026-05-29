import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Terms of Service | kajubadam Vocabulary",
    description:
        "Terms of Service for kajubadam Vocabulary — the rules and guidelines for using our bilingual English-Hindi vocabulary learning platform.",
};

export default function TermsPage() {
    return (
        <LegalPageClient title="Terms of Service">
            <p className="text-sm text-gray-400 mb-6">Last updated: May 29, 2026</p>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">
                These Terms of Service apply to your use of kajubadam Vocabulary
                (accessible at <strong>kajubadamvocabulary.in</strong>).
                Please read them carefully before using the Service.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing, browsing, or using kajubadam Vocabulary ("the Service",
                "the Platform", "we", "us", or "our"), you acknowledge that you have
                read, understood, and agree to be bound by these Terms of Service
                ("Terms"). If you do not agree to these Terms, you must not use
                the Service.
            </p>
            <p>
                By creating an account, making a purchase, or continuing to access
                any part of the Platform, you accept these Terms and our{" "}
                <a href="/privacy">Privacy Policy</a>.
            </p>

            <h2>2. Eligibility</h2>
            <p>
                You must be at least <strong>13 years of age</strong> to use the Service.
                If you are under 18, you must have a parent or legal guardian's consent
                to use the Service and make purchases. By using the Service, you represent
                that you meet these eligibility requirements.
            </p>
            <p>
                The Service is intended primarily for users in India. If you access the
                Service from outside India, you do so at your own risk and are responsible
                for compliance with local laws.
            </p>

            <h2>3. Account Registration & Security</h2>
            <p>
                You may use certain parts of the Service (free content) without creating
                an account. To access paid content, restore purchases, or manage your
                subscription, you must sign in using <strong>Google Sign-In</strong>.
            </p>
            <p>When you sign in with Google, we receive the following from your Google account:</p>
            <ul>
                <li>Your Google email address</li>
                <li>Your Google profile name</li>
                <li>Your Google profile picture (avatar URL)</li>
            </ul>
            <p>
                You are responsible for maintaining the confidentiality of your Google
                account credentials. We are not liable for any loss or damage arising
                from unauthorized use of your account. If you suspect unauthorized
                access, please contact us immediately.
            </p>

            <h2>4. Description of Service</h2>
            <p>
                kajubadam Vocabulary is an educational platform that provides bilingual
                (English-Hindi) vocabulary learning through:
            </p>
            <ul>
                <li>Immersive vocabulary stories with Hindi translations</li>
                <li>Interactive quizzes (error detection, sentence improvement)</li>
                <li>Daily news-based vocabulary exercises</li>
                <li>Preposition, homonym, idiom, phrasal verb, and proverb lessons</li>
            </ul>
            <p>
                The Service offers both <strong>free content</strong> (available to all
                users) and <strong>paid content</strong> (available to users who have
                purchased the applicable product). Paid products are described on our
                <a href="/pricing"> Pricing page</a>.
            </p>

            <h2>5. Purchases, Payments & Refunds</h2>
            <h3>5.1 Payment Processing</h3>
            <p>
                All payments are processed securely through{" "}
                <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway
                authorized by the Reserve Bank of India. We do not store credit/debit
                card numbers, UPI details, or net banking credentials on our servers.
            </p>
            <h3>5.2 Pricing & Currency</h3>
            <p>
                All prices are listed in <strong>Indian Rupees (INR)</strong> and are
                inclusive of applicable taxes. Prices are subject to change, but changes
                will not affect purchases already made.
            </p>
            <h3>5.3 Product Delivery</h3>
            <p>
                Upon successful payment, you receive <strong>lifetime access</strong> to
                the purchased product. Access is linked to the email address used during
                purchase. You can restore your access by signing in with the same Google
                account associated with that email.
            </p>
            <h3>5.4 Refund Policy</h3>
            <p>
                Due to the digital nature of our products (instant access to downloadable
                and viewable content), all purchases are{" "}
                <strong>non-refundable</strong> once access has been granted. However, we
                will review refund requests on a case-by-case basis for genuine issues
                such as:
            </p>
            <ul>
                <li>Duplicate charges due to payment gateway errors</li>
                <li>Technical issues preventing access despite successful payment</li>
            </ul>
            <p>
                To request a refund, contact us at{" "}
                <a href="mailto:contact@kajubadamvocabulary.in">
                    contact@kajubadamvocabulary.in
                </a>{" "}
                within <strong>7 days</strong> of purchase with your transaction ID.
            </p>

            <h2>6. Acceptable Use & User Conduct</h2>
            <p>You agree to use the Service only for lawful, educational purposes. You must not:</p>
            <ul>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to disrupt, hack, overload, or compromise the Service</li>
                <li>Scrape, crawl, copy, reproduce, or redistribute our content without our prior written permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Share, transfer, or sell your account credentials or access rights to others</li>
                <li>Use automated tools (bots, scripts) to access the Service</li>
                <li>Upload or transmit viruses, malware, or any malicious code</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Use the Service for any commercial purpose without our express consent</li>
                <li>Attempt to bypass content protection measures or access paid content without payment</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
                All content on kajubadam Vocabulary — including but not limited to
                stories, quizzes, translations, exercises, vocabulary lists, code,
                design, graphics, logos, and branding — is the exclusive intellectual
                property of kajubadam Vocabulary, unless otherwise stated. All rights
                not expressly granted are reserved.
            </p>
            <p>
                Daily news content used for educational exercises is sourced from
                publicly available news articles and is used under{" "}
                <strong>fair use</strong> principles for educational purposes.
                All editorial adaptations, translations, and quiz content are original
                works owned by the Platform.
            </p>
            <p>
                Unauthorized reproduction, distribution, modification, public display,
                or commercial use of our content is strictly prohibited and may result
                in legal action.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>The Service integrates with the following third-party services:</p>
            <ul>
                <li>
                    <strong>Google Sign-In (OAuth):</strong> Authentication is handled
                    via Google OAuth 2.0 through Supabase Auth. Your Google account
                    credentials are never shared with us directly — Google manages the
                    authentication flow.
                </li>
                <li>
                    <strong>Supabase:</strong> Your profile data (email, name, avatar),
                    purchase records, and transaction history are stored in Supabase,
                    our database and authentication provider.
                </li>
                <li>
                    <strong>Razorpay:</strong> Payment processing is handled entirely
                    by Razorpay. We only receive payment confirmation and transaction
                    IDs — never your financial details.
                </li>
                <li>
                    <strong>Google Tag Manager:</strong> We use GTM for basic analytics
                    to understand site usage patterns. No personally identifiable
                    information is transmitted through GTM.
                </li>
                <li>
                    <strong>Vercel:</strong> The Service is hosted on Vercel's
                    infrastructure.
                </li>
            </ul>
            <p>
                These third-party services have their own terms of service and privacy
                policies. We encourage you to review them.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
                THE SERVICE IS PROVIDED ON AN <strong>"AS IS"</strong> AND{" "}
                <strong>"AS AVAILABLE"</strong> BASIS, WITHOUT ANY WARRANTIES OF
                ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED
                BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of educational content</li>
                <li>Uninterrupted or error-free access to the Service</li>
                <li>Suitability of content for any specific examination or curriculum</li>
            </ul>
            <p>
                Educational content may contain errors or omissions. We appreciate
                corrections from our users and strive to fix them promptly.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
                KAJUBADAM VOCABULARY, ITS CREATORS, OPERATORS, OR AFFILIATES BE LIABLE
                FOR ANY:
            </p>
            <ul>
                <li>Direct, indirect, incidental, or consequential damages</li>
                <li>Loss of data, learning progress, or exam results</li>
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Damages arising from use or inability to use the Service</li>
                <li>Unauthorized access to or alteration of your transmissions or data</li>
            </ul>
            <p>
                Our total liability for any claim arising out of or relating to these
                Terms or the Service shall not exceed the total amount you have paid
                to us in the twelve (12) months preceding the claim.
            </p>

            <h2>11. Termination</h2>
            <p>
                We reserve the right to suspend or terminate your access to the Service
                at any time, without prior notice, for:
            </p>
            <ul>
                <li>Violation of these Terms of Service</li>
                <li>Engagement in fraudulent, abusive, or illegal activity</li>
                <li>Unauthorized commercial use of the Service or its content</li>
                <li>Circumvention of payment or access control mechanisms</li>
            </ul>
            <p>
                Upon termination, your right to access paid content will cease. No
                refunds will be provided for terminations due to violation of these
                Terms.
            </p>

            <h2>12. Governing Law & Dispute Resolution</h2>
            <p>
                These Terms shall be governed by and construed in accordance with the
                laws of <strong>India</strong>. Any disputes arising out of or relating
                to these Terms or the Service shall be subject to the exclusive
                jurisdiction of the courts in <strong>Mumbai, India</strong>.
            </p>
            <p>
                Before initiating legal proceedings, we encourage you to contact us at
                <a href="mailto:contact@kajubadamvocabulary.in">
                    contact@kajubadamvocabulary.in
                </a>{" "}
                to attempt informal resolution. If the dispute cannot be resolved within
                30 days, either party may seek legal remedies.
            </p>

            <h2>13. Changes to Terms</h2>
            <p>
                We reserve the right to modify, update, or replace these Terms at any
                time. Changes will be effective immediately upon posting on this page
                with an updated "Last updated" date. Your continued use of the Service
                after any changes constitutes acceptance of the new Terms.
            </p>
            <p>
                We encourage you to review these Terms periodically. For material
                changes, we will make reasonable efforts to notify users via email
                (if available) or through a notice on the Platform.
            </p>

            <h2>14. Severability</h2>
            <p>
                If any provision of these Terms is found to be unenforceable or invalid
                by a court of competent jurisdiction, that provision shall be limited
                or eliminated to the minimum extent necessary, and the remaining
                provisions shall remain in full force and effect.
            </p>

            <h2>15. Entire Agreement</h2>
            <p>
                These Terms, together with our{" "}
                <a href="/privacy">Privacy Policy</a>, constitute the entire
                agreement between you and kajubadam Vocabulary regarding your use
                of the Service, superseding any prior agreements or understandings.
            </p>

            <h2>16. Contact Information</h2>
            <p>
                For questions, concerns, or legal notices regarding these Terms,
                please contact us:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-6">
                <p className="text-[15px] text-gray-600 mb-1">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:contact@kajubadamvocabulary.in"
                       className="text-blue-600 hover:text-blue-800 underline">
                        contact@kajubadamvocabulary.in
                    </a>
                </p>
                <p className="text-[15px] text-gray-600 mb-1">
                    <strong>Website:</strong>{" "}
                    <a href="https://kajubadamvocabulary.in"
                       className="text-blue-600 hover:text-blue-800 underline">
                        kajubadamvocabulary.in
                    </a>
                </p>
                <p className="text-[15px] text-gray-600">
                    <strong>Jurisdiction:</strong> Mumbai, India
                </p>
            </div>
        </LegalPageClient>
    );
}