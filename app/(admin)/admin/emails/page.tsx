"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  getEmailConfig,
  renderTemplatePreview,
  sendDirectEmail,
  triggerVerification,
  triggerPasswordReset,
  type TemplateKey,
} from "./actions";

type Config = Awaited<ReturnType<typeof getEmailConfig>>;

type ResultSlot = { ok: boolean; message: string } | null;

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: "welcome", label: "Welcome" },
  { key: "verify", label: "Verify email" },
  { key: "reset", label: "Reset password" },
];

export default function AdminEmailsPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [target, setTarget] = useState("");
  const [previewKey, setPreviewKey] = useState<TemplateKey | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [directResults, setDirectResults] = useState<
    Record<TemplateKey, ResultSlot>
  >({ welcome: null, verify: null, reset: null });
  const [verifyResult, setVerifyResult] = useState<ResultSlot>(null);
  const [resetResult, setResetResult] = useState<ResultSlot>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getEmailConfig().then(setConfig);
  }, []);

  function loadPreview(key: TemplateKey) {
    setPreviewKey(key);
    setPreviewLoading(true);
    renderTemplatePreview(key)
      .then((html) => setPreviewHtml(html))
      .finally(() => setPreviewLoading(false));
  }

  function runDirectSend(key: TemplateKey) {
    startTransition(async () => {
      const res = await sendDirectEmail(key, target);
      setDirectResults((prev) => ({
        ...prev,
        [key]: res.ok
          ? { ok: true, message: res.message }
          : { ok: false, message: res.error },
      }));
    });
  }

  function runTriggerVerification() {
    startTransition(async () => {
      const res = await triggerVerification(target);
      setVerifyResult(
        res.ok
          ? { ok: true, message: res.message }
          : { ok: false, message: res.error },
      );
    });
  }

  function runTriggerReset() {
    startTransition(async () => {
      const res = await triggerPasswordReset(target);
      setResetResult(
        res.ok
          ? { ok: true, message: res.message }
          : { ok: false, message: res.error },
      );
    });
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Emails Admin</h1>
        <p className="text-muted-foreground mt-1">
          Dev-only tool for diagnosing the email pipeline. Blocked in
          production.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target email</CardTitle>
          <CardDescription>
            Used as the recipient for direct sends and as the user lookup for
            real-trigger flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="target" className="sr-only">
            Target email
          </Label>
          <Input
            id="target"
            type="email"
            placeholder="you@example.com"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Config inspector</CardTitle>
          <CardDescription>
            Resolved at the server. Secrets are never returned; only
            presence-booleans and non-secret values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!config ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <ConfigRow
                label="RESEND_API_KEY"
                value={
                  <BoolBadge
                    ok={config.resendApiKeyPresent}
                    okLabel="present"
                    badLabel="missing"
                  />
                }
              />
              <ConfigRow
                label="EMAIL_FROM"
                value={
                  <span
                    className={
                      config.emailFromIsPlaceholder
                        ? "text-destructive font-mono"
                        : "font-mono"
                    }
                  >
                    {config.emailFrom}
                    {config.emailFromIsPlaceholder && " (placeholder!)"}
                  </span>
                }
              />
              <ConfigRow
                label="NEXT_PUBLIC_APP_URL"
                value={
                  <span className="font-mono">
                    {config.appUrl ?? (
                      <span className="text-muted-foreground italic">
                        unset — falls back to {config.appUrlResolved}
                      </span>
                    )}
                  </span>
                }
              />
              <ConfigRow
                label="NEXTAUTH_URL (legacy)"
                value={
                  <BoolBadge
                    ok={!config.legacyNextauthUrlPresent}
                    okLabel="not set (good)"
                    badLabel="present — unused, can remove"
                    invert
                  />
                }
              />
              <ConfigRow
                label="NODE_ENV"
                value={<span className="font-mono">{config.nodeEnv}</span>}
              />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template preview</CardTitle>
          <CardDescription>
            Renders each React Email template server-side with sample data and
            displays the HTML in a sandboxed iframe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Button
                key={t.key}
                variant={previewKey === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => loadPreview(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>
          {previewKey && (
            <div className="border rounded-md overflow-hidden bg-white">
              {previewLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Rendering…</p>
              ) : (
                <iframe
                  title={`${previewKey} preview`}
                  srcDoc={previewHtml}
                  sandbox=""
                  className="w-full h-[600px]"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct send</CardTitle>
          <CardDescription>
            Sends each template directly via the sendEmail helper. Proves the
            Resend integration (API key + verified sender domain) works
            end-to-end, independent of any Better Auth flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEMPLATES.map((t) => {
            const result = directResults[t.key];
            return (
              <div
                key={t.key}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border rounded-md p-3"
              >
                <div className="font-medium w-32">{t.label}</div>
                <Button
                  size="sm"
                  onClick={() => runDirectSend(t.key)}
                  disabled={!target}
                >
                  Send to target
                </Button>
                {result && (
                  <ResultLine ok={result.ok} message={result.message} />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real triggers</CardTitle>
          <CardDescription>
            Invokes the actual Better Auth endpoints — exercises the same code
            path a real user would hit. The target must be an existing user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border rounded-md p-3">
            <div className="font-medium w-48">Resend verification</div>
            <Button
              size="sm"
              onClick={runTriggerVerification}
              disabled={!target}
            >
              Trigger
            </Button>
            {verifyResult && (
              <ResultLine ok={verifyResult.ok} message={verifyResult.message} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border rounded-md p-3">
            <div className="font-medium w-48">Request password reset</div>
            <Button size="sm" onClick={runTriggerReset} disabled={!target}>
              Trigger
            </Button>
            {resetResult && (
              <ResultLine ok={resetResult.ok} message={resetResult.message} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function BoolBadge({
  ok,
  okLabel,
  badLabel,
  invert,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
  invert?: boolean;
}) {
  const variant = ok ? (invert ? "secondary" : "default") : "destructive";
  return <Badge variant={variant}>{ok ? okLabel : badLabel}</Badge>;
}

function ResultLine({ ok, message }: { ok: boolean; message: string }) {
  return (
    <p
      className={`text-sm flex-1 break-words ${
        ok ? "text-emerald-600" : "text-destructive"
      }`}
    >
      {ok ? "✓ " : "✗ "}
      {message}
    </p>
  );
}
