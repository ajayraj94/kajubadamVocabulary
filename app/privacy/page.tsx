import type { Metadata } from "next";
import LegalPageClient from "@/app/legal/LegalPageClient";

export const metadata: Metadata = {
    title: "Privacy Policy | kajubadam Vocabulary",
    description:
        "Privacy Policy for kajubadam Vocabulary — Learn how we collect, use, and protect your data when you use our bilingual English-Hindi vocabulary learning platform.",
};

export default function PrivacyPage() {
    return (
        <LegalPageClient title="Privacy Policy">
            <p className="text-sm text-gray-400 mb-6">Last updated: May 29, 2026</p>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">
                This Privacy Policy explains how kajubadam Vocabulary
                ("we", "us", "our", or "the Platform") collects, uses,
                stores, and protects your personal information when you visit
                <strong> kajubadamvocabulary.in</strong> ("the Website").
            </p>

            <h2>1. Information We Collect</h2>
            <p>
                We collect different types of information depending on how you use the
                Service:
            </p>

            <h3>1.1 Information You Provide Voluntarily</h3>
            <p>
                When you <strong>sign in with Google</strong> (to purchase products or
                restore access), we receive the following information from your Google
                account:
            </p>
            <ul>
                <li>
                    <strong>Email Address:</strong> Used to identify your account and
                    link your purchases. This is the primary identifier for your
                    access rights.
                </li>
                <li>
                    <strong>Full Name:</strong> Your Google profile name, collected
                    only if you choose to provide it during sign-in.
                </li>
                <li>
                    <strong>Profile Picture (Avatar URL):</strong> Your Google profile
                    photo, if available.
                </li>
            </ul>
            <p>
                If you <strong>contact us via email</strong>, we collect your email
                address and any information you provide in your message.
            </p>

            <h3>1.2 Information Collected Automatically</h3>
            <ul>
                <li>
                    <strong>Usage Data:</strong> Basic analytics through Google Tag
                    Manager (aggregated page views, session duration, browser type).
                    No personally identifiable information is transmitted.
                </li>
                <li>
                    <strong>Device & Browser Information:</strong> IP address, browser
                    type, operating system, and device type for service optimization
                    and security.
                </li>
                <li>
                    <strong>Cookies:</strong> Essential session cookies used by Next.js
                    for basic functionality and authentication persistence (see
                    Section 4 below).
                </li>
            </ul>

            <h3>1.3 Data Stored Locally on Your Device</h3>
            <p>
                The following data is stored in your browser's <strong>local
                storage</strong> and never leaves your device unless you sign in:
            </p>
            <ul>
                <li>
                    <strong>Learning Progress:</strong> Which stories you've mastered,
                    news articles read, quiz scores, and completed vocab items.
                </li>
                <li>
                    <strong>Tab Preferences:</strong> Your last active tab selection
                    for smooth navigation.
                </li>
                <li>
                    <strong>Purchase Status:</strong> Whether you have purchased each
                    product (a boolean flag for offline access verification).
                </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <table className="w-full my-4">
                <thead>
                    <tr>
                        <th className="text-left font-semibold text-gray-700">Purpose</th>
                        <th className="text-left font-semibold text-gray-700">Data Used</th>
                        <th className="text-left font-semibold text-gray-700">Legal Basis</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Account authentication & access restoration</td>
                        <td>Email, Name</td>
                        <td>Contractual necessity</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td>Processing payments & preventing fraud</td>
                        <td>Email, Transaction ID</td>
                        <td>Legal obligation</td>
                    </tr>
                    <tr>
                        <td>Service improvement & analytics</td>
                        <td>Aggregated usage data</td>
                        <td>Legitimate interest</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td>Customer support & communication</td>
                        <td>Email, Name</td>
                        <td>Consent</td>
                    </tr>
                    <tr>
                        <td>Security & abuse prevention</td>
                        <td>IP address, Usage data</td>
                        <td>Legitimate interest</td>
                    </tr>
                </tbody>
            </table>

            <h2>3. How We Share Your Information</h2>
            <p>
                We do <strong>not</strong> sell, rent, or trade your personal
                information to third parties. We share your data only with the
                following service providers who help us operate the Platform:
            </p>
            <ul>
                <li>
                    <strong>Supabase Inc.</strong> — Cloud database & authentication
                    provider. Stores your email, name, avatar URL, purchase records,
                    and transaction history securely.{" "}
                    <a href="https://supabase.com/privacy"
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank" rel="noopener noreferrer">
                        Supabase Privacy Policy
                    </a>
                </li>
                <li>
                    <strong>Google LLC</strong> — Google Sign-In (OAuth 2.0) handles
                    authentication. We never receive your Google password. Google's
                    authentication system verifies your identity and shares only the
                    information you authorize.{" "}
                    <a href="https://policies.google.com/privacy"
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank" rel="noopener noreferrer">
                        Google Privacy Policy
                    </a>
                </li>
                <li>
                    <strong>Razorpay Software Pvt. Ltd.</strong> — Payment processing.
                    Razorpay handles all financial transactions and is PCI-DSS
                    Level 1 compliant. We do not store or process credit/debit card
                    numbers, UPI IDs, or bank account details. Razorpay shares only
                    transaction status and payment IDs with us.{" "}
                    <a href="https://razorpay.com/privacy"
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank" rel="noopener noreferrer">
                        Razorpay Privacy Policy
                    </a>
                </li>
                <li>
                    <strong>Vercel Inc.</strong> — Website hosting and infrastructure.
                    Vercel may process IP addresses and request data as part of
                    standard hosting operations.{" "}
                    <a href="https://vercel.com/legal/privacy-policy"
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank" rel="noopener noreferrer">
                        Vercel Privacy Policy
                    </a>
                </li>
                <li>
                    <strong>Google Tag Manager / Google Analytics</strong> — Basic
                    website analytics (aggregated, anonymized). No personally
                    identifiable information is shared.{" "}
                    <a href="https://policies.google.com/privacy"
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank" rel="noopener noreferrer">
                        Google Privacy Policy
                    </a>
                </li>
            </ul>

            <h2>4. Cookies & Tracking</h2>
            <p>
                We use minimal cookies for essential functionality:
            </p>
            <table className="w-full my-4">
                <thead>
                    <tr>
                        <th className="text-left font-semibold text-gray-700">Cookie Type</th>
                        <th className="text-left font-semibold text-gray-700">Purpose</th>
                        <th className="text-left font-semibold text-gray-700">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Session Cookie (Next.js)</td>
                        <td>Essential for website functionality and route management</td>
                        <td>Session</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td>Supabase Auth Cookie</td>
                        <td>Maintains your authenticated session when signed in</td>
                        <td>Persistent (until logout)</td>
                    </tr>
                </tbody>
            </table>
            <p>
                We do <strong>not</strong> use tracking cookies, advertising cookies,
                or third-party tracking pixels. You can control cookie settings
                through your browser preferences.
            </p>

            <h2>5. Data Storage & Security</h2>
            <p>
                We take reasonable technical and organizational measures to protect
                your data:
            </p>
            <ul>
                <li>
                    <strong>Encryption in Transit:</strong> All data transmitted
                    between your browser and our servers is encrypted using HTTPS/TLS.
                </li>
                <li>
                    <strong>Encryption at Rest:</strong> Data stored in Supabase is
                    encrypted at rest using industry-standard encryption.
                </li>
                <li>
                    <strong>Access Controls:</strong> Database access is restricted
                    through Row Level Security (RLS) policies and API-only access
                    patterns.
                </li>
                <li>
                    <strong>Minimal Data Collection:</strong> We collect only the
                    data necessary to provide the Service.
                </li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>We retain your data for the following periods:</p>
            <ul>
                <li>
                    <strong>Account Data (email, name, avatar):</strong> Retained as
                    long as you maintain a signed-in session on our Platform. You can
                    request deletion at any time (see Section 9).
                </li>
                <li>
                    <strong>Purchase Records:</strong> Retained permanently for legal
                    and accounting purposes (tax compliance, audit trails).
                </li>
                <li>
                    <strong>Transaction Data:</strong> Retained in accordance with
                    Indian tax laws and Razorpay's data retention policies.
                </li>
                <li>
                    <strong>Local Storage Data:</strong> Stored on your device until
                    you clear your browser data. We have no access to this data.
                </li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>
                Depending on your jurisdiction, you may have the following rights
                regarding your personal data:
            </p>
            <ul>
                <li>
                    <strong>Right to Access:</strong> Request a copy of the personal
                    data we hold about you.
                </li>
                <li>
                    <strong>Right to Rectification:</strong> Request correction of
                    inaccurate or incomplete data.
                </li>
                <li>
                    <strong>Right to Deletion ("Right to be Forgotten"):</strong>
                    Request deletion of your personal data, subject to legal
                    retention requirements.
                </li>
                <li>
                    <strong>Right to Data Portability:</strong> Request transfer of
                    your data to another service provider.
                </li>
                <li>
                    <strong>Right to Withdraw Consent:</strong> Withdraw consent for
                    processing where consent was the legal basis.
                </li>
                <li>
                    <strong>Right to Lodge a Complaint:</strong> File a complaint with
                    your local data protection authority.
                </li>
            </ul>
            <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:contact@kajubadamvocabulary.in">
                    contact@kajubadamvocabulary.in
                </a>.
                We will respond within <strong>30 days</strong>.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
                Our Service is a general educational platform suitable for learners of
                all ages, including children. We comply with the{" "}
                <strong>Children's Online Privacy Protection Act (COPPA)</strong> and
                similar regulations:
            </p>
            <ul>
                <li>
                    We do <strong>not</strong> knowingly collect personal information
                    from children under <strong>13 years of age</strong>.
                </li>
                <li>
                    If we discover that a child under 13 has provided us with personal
                    information without parental consent, we will delete that
                    information promptly.
                </li>
                <li>
                    If you are a parent or guardian and believe your child has provided
                    us with personal data, please contact us immediately.
                </li>
            </ul>

            <h2>9. Data Deletion Request</h2>
            <p>
                You can request deletion of your account and associated data at any
                time by emailing us at{" "}
                <a href="mailto:contact@kajubadamvocabulary.in">
                    contact@kajubadamvocabulary.in
                </a>{" "}
                from the email address associated with your account. We will:
            </p>
            <ul>
                <li>
                    Delete your personal data (email, name, avatar) from our database
                    within <strong>30 days</strong>.
                </li>
                <li>
                    Retain purchase and transaction records as required by applicable
                    Indian tax and accounting laws.
                </li>
                <li>
                    Confirm the deletion to you via email once complete.
                </li>
                <li>
                    Note: Your local browser data (learning progress) is stored on
                    your device and must be cleared by you.
                </li>
            </ul>

            <h2>10. Third-Party Links</h2>
            <p>
                The Service may contain links to external websites (e.g., news sources
                referenced in daily news articles). We are not responsible for the
                privacy practices or content of these third-party sites. We encourage
                you to review their privacy policies before providing any personal
                information.
            </p>

            <h2>11. Data Transfers (Cross-Border)</h2>
            <p>
                Your data may be transferred to and stored on servers located outside
                India through our service providers:
            </p>
            <ul>
                <li>
                    <strong>Supabase:</strong> Data stored on Google Cloud Platform
                    (GCP) servers, which may be located in the US or other regions.
                </li>
                <li>
                    <strong>Vercel:</strong> Global CDN with edge nodes worldwide.
                </li>
                <li>
                    <strong>Razorpay:</strong> Payment data processed within India
                    (compliant with RBI guidelines).
                </li>
            </ul>
            <p>
                We ensure appropriate safeguards are in place for cross-border data
                transfers as required under applicable law.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time to reflect changes
                in our practices, legal requirements, or operational needs. Changes
                will be posted on this page with an updated "Last updated" date.
            </p>
            <p>
                For material changes, we will notify users via email (if available)
                or through a notice on the Platform. We encourage you to review this
                policy periodically.
            </p>

            <h2>13. Governing Law</h2>
            <p>
                This Privacy Policy is governed by the laws of <strong>India</strong>.
                Any disputes arising from this Policy shall be subject to the exclusive
                jurisdiction of the courts in <strong>Mumbai, India</strong>.
            </p>

            <h2>14. Contact & Grievance Officer</h2>
            <p>
                If you have any questions, concerns, or grievances regarding this
                Privacy Policy or our data practices, please contact our Grievance
                Officer:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-6">
                <p className="text-[15px] text-gray-600 mb-1">
                    <strong>Grievance Officer:</strong> Site Administrator
                </p>
                <p className="text-[15px] text-gray-600 mb-1">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:contact@kajubadamvocabulary.in"
                       className="text-blue-600 hover:text-blue-800 underline">
                        contact@kajubadamvocabulary.in
                    </a>
                </p>
                <p className="text-[15px] text-gray-600 mb-1">
                    <strong>Response Time:</strong> We aim to respond within 48 hours
                    and resolve grievances within 30 days.
                </p>
                <p className="text-[15px] text-gray-600">
                    <strong>Jurisdiction:</strong> Mumbai, India
                </p>
            </div>
        </LegalPageClient>
    );
}