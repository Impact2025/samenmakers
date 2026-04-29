import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@samenmakers.nl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export async function sendWelcomeEmail(user: {
  email: string;
  naam?: string | null;
  name?: string | null;
}) {
  const naam = user.naam ?? user.name ?? "Maker";
  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: "Welkom bij Samenmakers!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">SAMENMAKERS</p>
        <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px;">Welkom, ${naam}!</h1>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Je account is aangemaakt. Vul je profiel in zodat andere impact-ondernemers jou kunnen vinden.
        </p>
        <a href="${APP_URL}/onboarding" style="display: inline-block; padding: 14px 28px; background: #2D6A4F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
          PROFIEL AANVULLEN →
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
          Je ontvangt deze e-mail omdat je je hebt aangemeld bij Samenmakers.
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
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">SAMENMAKERS</p>
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
  if (opts.newMatches === 0 && opts.recentPosts.length === 0 && opts.upcomingEvents.length === 0) {
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
    subject: "Jouw wekelijkse Samenmakers update",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #888; text-transform: uppercase; margin-bottom: 32px;">SAMENMAKERS DIGEST</p>
        <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 24px;">Hoi ${opts.naam}, dit week bij Samenmakers</h1>
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
