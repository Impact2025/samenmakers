import { z } from "zod";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import {
  users,
  emailCampaigns,
  emailCampaignRecipients,
  auditLog,
} from "@/server/db/schema";
import { segmentSchema, buildSegmentConditions, type Segment } from "@/server/admin/segment";
import { renderCampaignHtml, sendCampaignBatch } from "@/lib/email";
import { chatCompletion } from "@/lib/ai/openrouter";

const MAX_RECIPIENTS = 1000;

async function resolveRecipients(
  db: typeof import("@/server/db").db,
  segment: Segment,
) {
  const where = buildSegmentConditions(segment);
  return db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      where
        ? and(where, isNotNull(users.email), eq(users.status, "active"))
        : and(isNotNull(users.email), eq(users.status, "active")),
    )
    .limit(MAX_RECIPIENTS);
}

export const campaignsRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.emailCampaigns.findMany({
      orderBy: [desc(emailCampaigns.createdAt)],
      limit: 100,
    });
  }),

  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.db.query.emailCampaigns.findFirst({
        where: eq(emailCampaigns.id, input.id),
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return campaign;
    }),

  // Live recipient-count preview for a segment.
  preview: adminProcedure
    .input(segmentSchema)
    .query(async ({ ctx, input }) => {
      const recipients = await resolveRecipients(ctx.db, input);
      return { count: recipients.length, capped: recipients.length >= MAX_RECIPIENTS };
    }),

  // AI: draft a newsletter via OpenRouter.
  generate: adminProcedure
    .input(z.object({ topic: z.string().min(3), tone: z.string().optional() }))
    .mutation(async ({ input }) => {
      const raw = await chatCompletion({
        system:
          "Je bent een Nederlandse e-mailmarketeer voor Samenmakers, een platform voor " +
          "impact-ondernemers. Schrijf wervende, persoonlijke nieuwsbrieven. Antwoord UITSLUITEND met geldige JSON.",
        user: `Schrijf een nieuwsbrief over: ${input.topic}.
Toon: ${input.tone ?? "warm, activerend, beknopt"}.
Gebruik Markdown in de body (koppen, alinea's, eventueel een lijst en een call-to-action).
Antwoord met exact: { "subject": string, "body": string }`,
        maxTokens: 1500,
        temperature: 0.7,
      });
      if (!raw) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI niet beschikbaar. Stel OPENROUTER_API_KEY in.",
        });
      }
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Onverwacht AI-antwoord." });
      }
      const parsed = JSON.parse(raw.slice(start, end + 1)) as { subject?: string; body?: string };
      return { subject: parsed.subject ?? input.topic, body: parsed.body ?? "" };
    }),

  create: adminProcedure
    .input(
      z.object({
        subject: z.string().min(2).max(200),
        body: z.string().min(10),
        segment: segmentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipients = await resolveRecipients(ctx.db, input.segment);
      const [campaign] = await ctx.db
        .insert(emailCampaigns)
        .values({
          subject: input.subject,
          body: input.body,
          segment: JSON.stringify(input.segment),
          recipientCount: recipients.length,
          createdBy: ctx.userId,
        })
        .returning();
      return campaign;
    }),

  send: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.db.query.emailCampaigns.findFirst({
        where: eq(emailCampaigns.id, input.id),
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      if (campaign.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Campagne is al verzonden." });
      }

      const segment = (campaign.segment ? JSON.parse(campaign.segment) : {}) as Segment;
      const recipients = await resolveRecipients(ctx.db, segment);
      if (recipients.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Geen ontvangers in dit segment." });
      }

      await ctx.db
        .update(emailCampaigns)
        .set({ status: "sending", recipientCount: recipients.length })
        .where(eq(emailCampaigns.id, input.id));

      // Record recipients up-front.
      await ctx.db.insert(emailCampaignRecipients).values(
        recipients.map((r) => ({
          campaignId: input.id,
          userId: r.id,
          email: r.email!,
        })),
      );

      const html = renderCampaignHtml(campaign.body);
      const results = await sendCampaignBatch({
        subject: campaign.subject,
        html,
        recipients: recipients.map((r) => ({ email: r.email! })),
      });

      const okEmails = results.filter((r) => r.ok).map((r) => r.email);
      const failedEmails = results.filter((r) => !r.ok).map((r) => r.email);

      if (okEmails.length) {
        await ctx.db
          .update(emailCampaignRecipients)
          .set({ status: "sent", sentAt: new Date() })
          .where(
            and(
              eq(emailCampaignRecipients.campaignId, input.id),
              inArray(emailCampaignRecipients.email, okEmails),
            ),
          );
      }
      if (failedEmails.length) {
        await ctx.db
          .update(emailCampaignRecipients)
          .set({ status: "failed" })
          .where(
            and(
              eq(emailCampaignRecipients.campaignId, input.id),
              inArray(emailCampaignRecipients.email, failedEmails),
            ),
          );
      }

      await ctx.db
        .update(emailCampaigns)
        .set({
          status: failedEmails.length === results.length ? "failed" : "sent",
          sentCount: okEmails.length,
          failedCount: failedEmails.length,
          sentAt: new Date(),
        })
        .where(eq(emailCampaigns.id, input.id));

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "send_campaign",
        targetType: "email_campaign",
        targetId: input.id,
        details: JSON.stringify({ sent: okEmails.length, failed: failedEmails.length }),
      });

      return { sent: okEmails.length, failed: failedEmails.length };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(emailCampaigns).where(eq(emailCampaigns.id, input.id));
      return { success: true };
    }),
});
