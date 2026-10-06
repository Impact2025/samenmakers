import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSiteFormEmail } from "@/lib/email";
import { checkAuthLimit, clientIp } from "@/lib/ratelimit";

const samenwerken = z.object({
  kind: z.literal("samenwerken"),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  organisation: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(500),
});

const interesse = z.object({
  kind: z.literal("interesse"),
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  organization: z.string().trim().max(200).optional(),
  program: z.enum([
    "SocialEntrepreneurship",
    "SocialIntrapreneurship",
    "ReshapingYourFuture",
  ]),
  subject: z.string().trim().min(2).max(100),
  message: z.string().trim().min(5).max(500),
});

const schema = z.discriminatedUnion("kind", [samenwerken, interesse]);

export async function POST(req: Request) {
  if (!(await checkAuthLimit("siteForm", clientIp(req)))) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "We konden je aanvraag niet verwerken. Controleer je gegevens.",
      },
      { status: 400 },
    );
  }

  const d = parsed.data;
  try {
    if (d.kind === "samenwerken") {
      await sendSiteFormEmail({
        subject: `Samenwerking: ${d.name}`,
        replyTo: d.email,
        fields: {
          Naam: d.name,
          "E-mail": d.email,
          Organisatie: d.organisation,
          Bericht: d.message,
        },
      });
    } else {
      await sendSiteFormEmail({
        subject: `Interesse: ${d.subject}`,
        replyTo: d.email,
        fields: {
          Naam: `${d.firstName} ${d.lastName}`,
          "E-mail": d.email,
          Telefoon: d.phone,
          Organisatie: d.organization,
          Programma: d.program,
          Onderwerp: d.subject,
          Bericht: d.message,
        },
      });
    }
  } catch (e) {
    console.error("[site-contact] mail mislukt:", e);
    return NextResponse.json(
      {
        error:
          "We konden je aanvraag niet verwerken. Probeer het later opnieuw.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
