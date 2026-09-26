import { Resend } from "resend";
import type { PlatformMetrics } from "@/server/admin/metrics";
import { renderMarkdown } from "@/lib/markdown";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@samenmakers.nl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";
const MANAGEMENT_EMAIL =
  process.env.MANAGEMENT_EMAIL ?? "v.munster@weareimpact.nl";

export async function sendWelcomeEmail(user: {
  email: string;
  naam?: string | null;
  name?: string | null;
}) {
  const naam = user.naam ?? user.name ?? "Maker";
  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: "Welkom bij We Shape the Future!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">WE SHAPE THE FUTURE</p>
        <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px;">Welkom, ${naam}!</h1>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Je account is aangemaakt. Vul je profiel in zodat andere impact-ondernemers jou kunnen vinden.
        </p>
        <a href="${APP_URL}/onboarding" style="display: inline-block; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
          PROFIEL AANVULLEN →
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
          Je ontvangt deze e-mail omdat je je hebt aangemeld bij We Shape the Future.
          <a href="${APP_URL}/instellingen/notificaties" style="color: #555;">Notificaties beheren</a>
        </p>
      </div>
    `,
  });
}

export async function sendMatchEmail(opts: {
  to: string;
  naam: string;
  matchNaam: string;
  matchId: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Nieuwe match: ${opts.matchNaam}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">WE SHAPE THE FUTURE</p>
        <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px;">Je hebt een match!</h1>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Hoi ${opts.naam}, jullie zijn allebei geïnteresseerd in samenwerken. Stuur ${opts.matchNaam} een berichtje.
        </p>
        <a href="${APP_URL}/berichten/${opts.matchId}" style="display: inline-block; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
          BERICHT STUREN →
        </a>
      </div>
    `,
  });
}

export async function sendWeeklyDigest(opts: {
  to: string;
  naam: string;
  newMatches: number;
  recentPosts: Array<{ title: string; slug: string }>;
  upcomingEvents: Array<{ title: string; id: string; startAt: Date }>;
}) {
  if (
    opts.newMatches === 0 &&
    opts.recentPosts.length === 0 &&
    opts.upcomingEvents.length === 0
  ) {
    return;
  }

  const postsHtml = opts.recentPosts
    .map(
      (p) =>
        `<li style="margin-bottom:8px;"><a href="${APP_URL}/kennis/${p.slug}" style="color:#2D6A4F;">${p.title}</a></li>`,
    )
    .join("");

  const eventsHtml = opts.upcomingEvents
    .map(
      (e) =>
        `<li style="margin-bottom:8px;"><a href="${APP_URL}/events/${e.id}" style="color:#2D6A4F;">${e.title}</a></li>`,
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: "Jouw wekelijkse We Shape the Future update",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">WE SHAPE THE FUTURE DIGEST</p>
        <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 24px;">Hoi ${opts.naam}, dit week bij We Shape the Future</h1>
        ${opts.newMatches > 0 ? `<p style="margin-bottom:16px;"><strong>${opts.newMatches} nieuwe match${opts.newMatches > 1 ? "es" : ""}</strong> wachten op je reactie.</p>` : ""}
        ${opts.recentPosts.length > 0 ? `<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Nieuwe artikelen</h2><ul style="padding-left:16px;margin-bottom:24px;">${postsHtml}</ul>` : ""}
        ${opts.upcomingEvents.length > 0 ? `<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Aankomende events</h2><ul style="padding-left:16px;margin-bottom:24px;">${eventsHtml}</ul>` : ""}
        <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
          NAAR DASHBOARD →
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
          <a href="${APP_URL}/instellingen/notificaties" style="color: #555;">Digest uitschakelen</a>
        </p>
      </div>
    `,
  });
}

// =============================================
// CRM EMAIL CAMPAIGNS
// =============================================

/** Wraps campaign Markdown in the We Shape the Future house style. */
export function renderCampaignHtml(bodyMarkdown: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height:1.6;">
      <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 24px;">WE SHAPE THE FUTURE</p>
      <div style="font-size:15px;color:#333;">${renderMarkdown(bodyMarkdown)}</div>
      <p style="font-size: 12px; color: #aaa; margin-top: 40px; border-top:1px solid #eee; padding-top:16px;">
        Je ontvangt deze e-mail als lid van We Shape the Future.
        <a href="${APP_URL}/instellingen/notificaties" style="color: #555;">Voorkeuren beheren</a>
      </p>
    </div>`;
}

/**
 * Sends a campaign to many recipients using Resend's batch API (chunks of 100).
 * Returns per-email success/failure so the caller can record recipient status.
 */
export async function sendCampaignBatch(opts: {
  subject: string;
  html: string;
  recipients: Array<{ email: string }>;
}): Promise<Array<{ email: string; ok: boolean; error?: string | undefined }>> {
  const results: Array<{
    email: string;
    ok: boolean;
    error?: string | undefined;
  }> = [];
  const chunkSize = 100;

  for (let i = 0; i < opts.recipients.length; i += chunkSize) {
    const chunk = opts.recipients.slice(i, i + chunkSize);
    try {
      const { error } = await getResend().batch.send(
        chunk.map((r) => ({
          from: FROM,
          to: r.email,
          subject: opts.subject,
          html: opts.html,
        })),
      );
      const ok = !error;
      for (const r of chunk) {
        results.push({ email: r.email, ok, error: error?.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "send failed";
      for (const r of chunk)
        results.push({ email: r.email, ok: false, error: message });
    }
  }

  return results;
}

// =============================================
// MANAGEMENT DIGEST (intern — naar management)
// =============================================

function kpiRow(label: string, value: string | number, sub?: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;">
        ${value}${sub ? `<span style="font-size:11px;font-weight:400;color:#999;"> ${sub}</span>` : ""}
      </td>
    </tr>`;
}

export async function sendManagementDigest(opts: {
  metrics: PlatformMetrics;
  insight: string | null;
  to?: string;
}) {
  const m = opts.metrics;
  const isDaily = m.period === "daily";
  const title = isDaily ? "Dagelijkse" : "Wekelijkse";
  const dateLabel = m.generatedAt.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const growthSign = m.userGrowthPct >= 0 ? "+" : "";
  const insightHtml = opts.insight
    ? `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:32px 0 8px;">AI Systeemanalyse</h2>
       <div style="font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;background:#f7f7f5;padding:16px;border-left:3px solid #2D6A4F;">${opts.insight}</div>`
    : `<p style="font-size:12px;color:#aaa;margin-top:24px;">AI-analyse niet beschikbaar (OPENROUTER_API_KEY ontbreekt).</p>`;

  const backlogFlag =
    m.pendingReports > 0 || m.unpublishedPosts > 0
      ? `<p style="font-size:13px;color:#b45309;background:#fffbeb;padding:12px;margin-top:16px;">
           ⚠️ Openstaand: ${m.pendingReports} report(s), ${m.unpublishedPosts} post(s) wachten op review.
         </p>`
      : "";

  await getResend().emails.send({
    from: FROM,
    to: opts.to ?? MANAGEMENT_EMAIL,
    subject: `We Shape the Future ${title} Management Rapport — ${dateLabel}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 8px;">WE SHAPE THE FUTURE · MANAGEMENT</p>
        <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 4px;">${title} rapport</h1>
        <p style="font-size: 13px; color: #999; margin-bottom: 24px;">${dateLabel} · ${m.windowLabel}</p>

        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:4px;">Groei & Gebruikers</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${kpiRow("Totaal gebruikers", m.totalUsers)}
          ${kpiRow("Nieuwe gebruikers", m.newUsersInWindow, `(${growthSign}${m.userGrowthPct}% vs vorige periode)`)}
          ${kpiRow("Actieve gebruikers", m.activeUsersInWindow, "(verzonden berichten)")}
        </table>

        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:24px 0 4px;">Omzet</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${kpiRow("MRR", `€${m.mrr}`)}
          ${kpiRow("Pro-gebruikers", m.proUsers, `(${m.proConversionPct}% conversie)`)}
          ${kpiRow("Opgezegde abonnementen", m.canceledSubscriptions)}
        </table>

        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:24px 0 4px;">Clubs (cohorten)</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${kpiRow("Aantal clubs", m.totalCohorts)}
          ${kpiRow("Totaal clubleden", m.totalCohortMembers, `(gem. ${m.avgMembersPerCohort}/club)`)}
        </table>

        <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:24px 0 4px;">Engagement & Content</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${kpiRow("Match rate", `${m.matchRate}%`, `(${m.newMatchesInWindow} nieuw)`)}
          ${kpiRow("Berichten", m.totalMessages, `(${m.messagesInWindow} nieuw)`)}
          ${kpiRow("Gepubliceerde posts", m.publishedPosts, `(${m.newPostsInWindow} nieuw)`)}
          ${kpiRow("Aankomende events", m.upcomingEvents)}
        </table>

        ${backlogFlag}
        ${insightHtml}

        <a href="${APP_URL}/admin" style="display: inline-block; margin-top:32px; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
          NAAR ADMIN DASHBOARD →
        </a>
        <p style="font-size: 11px; color: #bbb; margin-top: 32px;">
          Automatisch gegenereerd door We Shape the Future Admin · ${m.generatedAt.toLocaleString("nl-NL")}
        </p>
      </div>
    `,
  });
}

// =============================================
// EVENTS (bevestiging, wachtlijst, herinnering, wijziging, annulering)
// =============================================

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EventEmailInput {
  to: string;
  subject: string;
  heading: string;
  /** Platte tekst; wordt ge-escaped. */
  intro: string;
  event: { title: string; when: string; where: string };
  cta: { label: string; url: string };
  /** Extra regels onder het event, bijv. tickets met eigen link of een bedrag. */
  lines?: { text: string; url?: string }[];
  /** Optionele .ics-bijlage (bevestiging en wijziging). */
  ics?: string;
}

export async function sendEventEmail(opts: EventEmailInput) {
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">WE SHAPE THE FUTURE EVENTS</p>
      <h1 style="font-size: 26px; font-weight: 900; margin-bottom: 12px;">${escapeHtml(opts.heading)}</h1>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px;">${escapeHtml(opts.intro)}</p>
      <table style="width:100%;border:1px solid #eee;margin-bottom:24px;border-collapse:collapse;">
        <tr><td style="padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:800;">${escapeHtml(opts.event.title)}</p>
          <p style="margin:0;font-size:13px;color:#555;">${escapeHtml(opts.event.when)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;">${escapeHtml(opts.event.where)}</p>
        </td></tr>
      </table>
      ${
        opts.lines?.length
          ? `<ul style="padding-left:18px;margin:0 0 24px;font-size:14px;color:#333;line-height:1.7;">${opts.lines
              .map((l) =>
                l.url
                  ? `<li><a href="${l.url}" style="color:#2D6A4F;">${escapeHtml(l.text)}</a></li>`
                  : `<li>${escapeHtml(l.text)}</li>`,
              )
              .join("")}</ul>`
          : ""
      }
      <a href="${opts.cta.url}" style="display: inline-block; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
        ${escapeHtml(opts.cta.label)} &rarr;
      </a>
      <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
        Je ontvangt deze e-mail omdat je je hebt aangemeld voor dit event.
        <a href="${APP_URL}/instellingen/notificaties" style="color: #555;">Notificaties beheren</a>
      </p>
    </div>`;

  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html,
    ...(opts.ics
      ? {
          attachments: [
            {
              filename: "event.ics",
              content: Buffer.from(opts.ics).toString("base64"),
              contentType: "text/calendar; charset=utf-8; method=PUBLISH",
            },
          ],
        }
      : {}),
  });
}
