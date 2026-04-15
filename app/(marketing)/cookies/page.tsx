export const metadata = { title: 'Cookie Policy — StudyBug' }

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Cookie Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences over time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Cookies We Use</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">Essential Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-2">These cookies are strictly necessary for the service to function. They cannot be disabled.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground border rounded-lg">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-3 font-semibold">Cookie</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">better-auth.session_token</td>
                  <td className="p-3">Keeps you logged in between page visits</td>
                  <td className="p-3">Session / 7 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">better-auth.csrf_token</td>
                  <td className="p-3">Protects against cross-site request forgery attacks</td>
                  <td className="p-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">Analytics Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We may use privacy-friendly analytics to understand how visitors use StudyBug. These cookies do not track you across other websites and do not contain personally identifiable information.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Currently we use aggregated server-side analytics only. If we add client-side analytics we will update this policy and request your consent where required.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Third-Party Cookies</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Stripe</strong> may set cookies when you interact with our payment flow. These are governed by <a href="https://stripe.com/cookies-policy/legal" className="text-primary underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Cookie Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How to Manage Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from using StudyBug as they are required for authentication.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary underline" target="_blank" rel="noopener noreferrer">Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-primary underline" target="_blank" rel="noopener noreferrer">Firefox</a></li>
            <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-primary underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" className="text-primary underline" target="_blank" rel="noopener noreferrer">Edge</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Cookie Policy from time to time. The &quot;last updated&quot; date at the top of this page shows when it was most recently revised.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about cookies? Email <a href="mailto:privacy@studybug.app" className="text-primary underline">privacy@studybug.app</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
