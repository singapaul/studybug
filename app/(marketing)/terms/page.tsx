export const metadata = { title: 'Terms of Service — StudyBug' }

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using StudyBug you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">You agree to use StudyBug only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Upload content that infringes third-party intellectual property rights.</li>
            <li>Use the service to transmit harmful, abusive, or illegal content.</li>
            <li>Attempt to reverse-engineer, scrape, or interfere with the service.</li>
            <li>Share your account credentials with others.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the security of your account and password. StudyBug cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Subscriptions and Billing</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Paid subscriptions are billed on a recurring basis (monthly or annually) via Stripe.</li>
            <li>You may cancel your subscription at any time from the billing settings. Cancellation takes effect at the end of the current billing period.</li>
            <li>We do not offer refunds for partial billing periods, except where required by applicable law.</li>
            <li>We reserve the right to change subscription pricing with 30 days&apos; notice. Continued use after the notice period constitutes acceptance of the new pricing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Your content:</strong> You retain full ownership of the games and study materials you create. By uploading content you grant StudyBug a limited licence to store and display it solely for the purpose of providing the service to you.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong>Our content:</strong> The StudyBug platform, brand, and all associated software are the intellectual property of StudyBug. You may not copy, modify, or distribute them without our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, StudyBug shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or profits, arising from your use of the service. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            The service is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind. We do not guarantee that the service will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your account at our discretion if you breach these terms. You may delete your account at any time from the settings page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. We will notify you of material changes by email or in-app notice at least 14 days before they take effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">11. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms? Email <a href="mailto:legal@studybug.app" className="text-primary underline">legal@studybug.app</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
