import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { syncApplication, syncBooking, syncOptIn } from "./close";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Attribution = { source?: string; medium?: string; campaign?: string; content?: string };

function text(value: unknown, field: string, required = true) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new Error(`${field} is required.`);
  return result;
}

function optional(value: unknown) {
  const result = typeof value === "string" ? value.trim() : "";
  return result || undefined;
}

function email(value: unknown) {
  const result = text(value, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error("A valid email is required.");
  return result;
}

function attribution(value: unknown): Attribution {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    source: optional(source.source),
    medium: optional(source.medium),
    campaign: optional(source.campaign),
    content: optional(source.content),
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "Unknown synchronization error.";
}

function options(path: string) {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
  });
}

options("/opt-ins");
options("/applications");
options("/bookings");

http.route({
  path: "/opt-ins",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const input = {
        name: text(body.name, "Name"),
        email: email(body.email),
        submittedAt: Date.now(),
        landingPage: text(body.landingPage, "Landing page"),
        userAgent: optional(body.userAgent),
        attribution: attribution(body.attribution),
      };
      const recorded = await ctx.runMutation(internal.optIns.record, input);
      if (!recorded.isDuplicate) {
        await ctx.scheduler.runAfter(0, internal.discord.optIn, {
          name: input.name,
          email: input.email,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncOptIn(input);
          await ctx.runMutation(internal.optIns.markSync, {
            optInId: recorded.optInId,
            status: "synced",
            closeLeadId: synced.leadId,
            closeActivityId: synced.activityId,
          });
        } catch (error) {
          await ctx.runMutation(internal.optIns.markSync, {
            optInId: recorded.optInId,
            status: "failed",
            error: errorMessage(error),
          });
        }
      }
      return Response.json({ optInId: recorded.optInId, duplicate: recorded.isDuplicate }, { status: 201, headers: corsHeaders });
    } catch (error) {
      return Response.json({ error: errorMessage(error) }, { status: 400, headers: corsHeaders });
    }
  }),
});

http.route({
  path: "/applications",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const urgency = text(body.urgency, "Urgency");
      const liquidCapital = text(body.liquidCapital, "Investment capacity");
      const qualificationStatus = liquidCapital === "$2,500+" && urgency !== "Just browsing"
        ? "qualified" as const
        : "unqualified" as const;
      const input = {
        currentWork: text(body.currentWork, "Current work"),
        currentIncome: text(body.currentIncome, "Current income"),
        incomeGoal: text(body.incomeGoal, "Income goal"),
        experience: text(body.experience, "Sales experience"),
        urgency,
        name: text(body.name, "Name"),
        email: email(body.email),
        instagram: text(body.instagram, "Instagram"),
        phone: text(body.phone, "Phone"),
        liquidCapital,
        nonMarketingConsent: body.nonMarketingConsent === true,
        marketingConsent: body.marketingConsent === true,
        qualificationStatus,
        submittedAt: Date.now(),
        landingPage: text(body.landingPage, "Landing page"),
        userAgent: optional(body.userAgent),
        attribution: attribution(body.attribution),
      };
      if (!input.nonMarketingConsent || !input.marketingConsent) throw new Error("Both communication consents are required.");
      const recorded = await ctx.runMutation(internal.applications.record, input);
      if (!recorded.isDuplicate) {
        await ctx.scheduler.runAfter(0, internal.discord.application, {
          name: input.name,
          email: input.email,
          phone: input.phone,
          instagram: input.instagram,
          currentIncome: input.currentIncome,
          liquidCapital: input.liquidCapital,
          qualificationStatus: input.qualificationStatus,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncApplication({
            ...input,
            closeLeadId: recorded.closeLeadId,
            closeOpportunityId: recorded.closeOpportunityId,
          });
          await ctx.runMutation(internal.applications.markSync, {
            applicationId: recorded.applicationId,
            status: "synced",
            closeLeadId: synced.leadId,
            closeOpportunityId: synced.opportunityId,
            closeActivityId: synced.activityId,
          });
        } catch (error) {
          await ctx.runMutation(internal.applications.markSync, {
            applicationId: recorded.applicationId,
            status: "failed",
            error: errorMessage(error),
          });
        }
      }
      return Response.json({
        applicationId: recorded.applicationId,
        qualificationStatus,
        duplicate: recorded.isDuplicate,
      }, { status: 201, headers: corsHeaders });
    } catch (error) {
      return Response.json({ error: errorMessage(error) }, { status: 400, headers: corsHeaders });
    }
  }),
});

http.route({
  path: "/bookings",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const input = {
        name: text(body.name, "Name"),
        email: email(body.email),
        phone: optional(body.phone),
        callStart: text(body.callStart, "Call start"),
        timeZone: text(body.timeZone, "Time zone"),
        meetingLink: text(body.meetingLink, "Meeting link"),
        setterName: optional(body.setterName),
        closerName: optional(body.closerName),
        submittedAt: Date.now(),
        attribution: attribution(body.attribution),
      };
      const recorded = await ctx.runMutation(internal.bookings.record, input);
      if (!recorded.isDuplicate) {
        await ctx.scheduler.runAfter(0, internal.discord.booking, {
          name: input.name,
          email: input.email,
          callStart: input.callStart,
          timeZone: input.timeZone,
          setterName: input.setterName,
          closerName: input.closerName,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncBooking({
            ...input,
            closeLeadId: recorded.closeLeadId,
            closeOpportunityId: recorded.closeOpportunityId,
          });
          await ctx.runMutation(internal.bookings.markSync, {
            bookingId: recorded.bookingId,
            status: "synced",
            closeLeadId: synced.leadId,
            closeOpportunityId: synced.opportunityId,
            closeActivityId: synced.activityId,
          });
        } catch (error) {
          await ctx.runMutation(internal.bookings.markSync, {
            bookingId: recorded.bookingId,
            status: "failed",
            error: errorMessage(error),
          });
        }
      }
      return Response.json({ bookingId: recorded.bookingId, duplicate: recorded.isDuplicate }, { status: 201, headers: corsHeaders });
    } catch (error) {
      return Response.json({ error: errorMessage(error) }, { status: 400, headers: corsHeaders });
    }
  }),
});

export default http;
