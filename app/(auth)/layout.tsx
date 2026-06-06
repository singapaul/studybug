// Auth pages are viewed logged-out (no theme toggle) and share the bright,
// light look of the marketing site. `force-light` keeps them light even when
// the visitor's system preference would otherwise resolve to dark.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="force-light">{children}</div>;
}
