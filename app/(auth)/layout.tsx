// Auth pages are viewed logged-out (no theme toggle) and share the bright,
// light look of the marketing site. `force-light` keeps them light even when
// the visitor's system preference would otherwise resolve to dark.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // `force-light` only redefines the theme CSS variables; it doesn't set a base
  // color/background. Without these, text with no explicit color (labels, the
  // outline "Continue with Google" button) inherits the ambient color — which
  // is light when the visitor's system is in dark mode — and renders unreadable
  // on the white card. Anchor the base foreground/background to the light theme.
  return (
    <div className="force-light min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
