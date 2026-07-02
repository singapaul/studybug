import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withLogging } from "@/lib/with-logging";
import { sendEmail } from "@/lib/email";
import DemoRequestEmail from "@/emails/demo-request";

// Where demo requests are delivered. Overridable via env for staging/testing.
const DEMO_REQUEST_TO = process.env.DEMO_REQUEST_TO ?? "pg@26pairs.com";

const DemoRequestSchema = z.object({
  schoolName: z.string().min(1).max(100),
  contactName: z.string().min(1).max(100),
  contactRole: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(20),
  numberOfStudents: z.string().min(1).max(40),
  numberOfTeachers: z.string().min(1).max(40),
  preferredMorning: z.boolean().optional().default(false),
  preferredAfternoon: z.boolean().optional().default(false),
  specificDate: z.string().max(40).optional().default(""),
  additionalNotes: z.string().max(2000).optional().default(""),
});

async function postHandler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = DemoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const preferredTimes = [
    data.preferredMorning ? "Morning (9am-12pm)" : null,
    data.preferredAfternoon ? "Afternoon (12pm-5pm)" : null,
  ]
    .filter(Boolean)
    .join(", ");

  try {
    await sendEmail({
      to: DEMO_REQUEST_TO,
      subject: `Demo request — ${data.schoolName}`,
      replyTo: data.email,
      react: DemoRequestEmail({
        schoolName: data.schoolName,
        contactName: data.contactName,
        contactRole: data.contactRole,
        email: data.email,
        phone: data.phone,
        numberOfStudents: data.numberOfStudents,
        numberOfTeachers: data.numberOfTeachers,
        preferredTimes: preferredTimes || undefined,
        specificDate: data.specificDate || undefined,
        additionalNotes: data.additionalNotes || undefined,
      }),
    });
  } catch (err) {
    console.error("POST /api/schools/demo send failed:", err);
    return NextResponse.json(
      { error: "Could not send your request. Please email us directly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export const POST = withLogging(postHandler, "POST /api/schools/demo");
