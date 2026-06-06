import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isPro } from "@/lib/api-helpers";
import { withLogging } from "@/lib/with-logging";
import { getAttemptRecordsForExport } from "@/lib/progress-data";
import { attemptsToCsv } from "@/lib/progress-insights";

async function getHandler(req: NextRequest) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req);
    if (!isPro(plan)) {
      return NextResponse.json({ error: "Pro plan required", code: "PRO_REQUIRED" }, { status: 403 });
    }

    const daysParam = req.nextUrl.searchParams.get("days");
    const days = daysParam && daysParam !== "all" ? Number(daysParam) : null;

    const records = await getAttemptRecordsForExport(userId, Number.isFinite(days) ? days : null);
    const csv = attemptsToCsv(records);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="progress.csv"',
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/progress/export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withLogging(getHandler, "GET /api/progress/export");
