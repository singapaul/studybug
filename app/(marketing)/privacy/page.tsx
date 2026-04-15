export const metadata = { title: 'Privacy Policy — StudyBug' }

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            StudyBug (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it. By using StudyBug you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>Account information:</strong> your name, email address, and (if you sign up via Google) your profile picture.</li>
            <li><strong>Payment information:</strong> billing details handled securely by Stripe. We never store full card numbers.</li>
            <li><strong>Usage data:</strong> game content you create, scores, and study activity, used to power your progress dashboard.</li>
            <li><strong>Technical data:</strong> IP address, browser type, and device identifiers collected automatically for security and performance.</li>
            <li><strong>Cookies:</strong> session and preference cookies. See our Cookie Policy for details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Providing and improving the StudyBug service.</li>
            <li>Processing payments and managing your subscription via Stripe.</li>
            <li>Sending transactional emails (account confirmations, password resets) via Resend.</li>
            <li>Analysing aggregate usage to improve features — we never sell individual data to third parties.</li>
            <li>Complying with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">We share data with the following processors only to the extent necessary to provide the service:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>Stripe</strong> — payment processing and subscription management.</li>
            <li><strong>Resend</strong> — transactional email delivery.</li>
            <li><strong>Neon</strong> — hosted PostgreSQL database.</li>
            <li><strong>Vercel</strong> — application hosting and edge network.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your account data for as long as your account is active. If you delete your account, your personal data and game content will be permanently removed within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>Access</strong> a copy of the personal data we hold about you.</li>
            <li><strong>Rectify</strong> inaccurate data.</li>
            <li><strong>Erase</strong> your data (&quot;right to be forgotten&quot;).</li>
            <li><strong>Export</strong> your data in a machine-readable format.</li>
            <li><strong>Object</strong> to or restrict certain types of processing.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise any of these rights, contact us at <a href="mailto:privacy@studybug.app" className="text-primary underline">privacy@studybug.app</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use industry-standard encryption in transit (TLS) and at rest, and limit access to your personal data to authorised personnel only. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy from time to time. We will notify you of significant changes by email or a prominent notice in the app. The &quot;last updated&quot; date at the top of this page indicates when it was most recently revised.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related questions or requests, email <a href="mailto:privacy@studybug.app" className="text-primary underline">privacy@studybug.app</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
