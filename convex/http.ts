import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { syncApplication, syncBooking, syncNativeCalendarBooking, syncOptIn, syncOutcome } from "./ghl";
import mappings from "../config/ghl-mappings.json";

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
options("/calendar-booked");
options("/outcomes");

const validOutcomes = [
  "Deal Closed",
  "Deal Won",
  "Follow Up",
  "Deal Lost",
  "No Show",
  "Rescheduled",
  "Disqualified",
  "Not Contacted",
] as const;

type Outcome = typeof validOutcomes[number];

function answerMap(body: Record<string, any>) {
  const values = new Map<string, unknown>();
  for (const field of Array.isArray(body.fields) ? body.fields : []) {
    if (!field || typeof field !== "object") continue;
    const key = String(field.question || field.name || field.id || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (key) values.set(key, field.answer ?? field.value);
  }
  const get = (...names: string[]) => {
    for (const name of names) {
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const direct = body[name] ?? body[key.replaceAll(" ", "_")];
      const value = direct ?? values.get(key);
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return undefined;
  };
  return get;
}

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
          landingPage: input.landingPage,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncOptIn(input);
          await ctx.runMutation(internal.optIns.markSync, {
            optInId: recorded.optInId,
            status: "synced",
            ghlContactId: synced.contactId,
            ghlNoteId: synced.noteId,
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
  path: "/outcomes",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as Record<string, any>;
      const get = answerMap(body);
      const rawOutcome = get("Outcome", "outcome");
      if (!rawOutcome || !validOutcomes.includes(rawOutcome as Outcome)) {
        if (body.event_type === "submission") {
          return Response.json({ accepted: true, test: true }, { status: 202, headers: corsHeaders });
        }
        throw new Error("A valid outcome is required.");
      }
      const input = {
        submissionKey: text(body.event_id || body.submission_id || `${get("Email")}:${rawOutcome}:${get("Date of Call", "Date Closed", "Date Lost") || ""}`, "Submission ID"),
        name: text(get("Name"), "Name"),
        email: email(get("Email")),
        setterName: optional(get("Setter", "Setter Name")),
        closerName: optional(get("Closer", "Closer Name")),
        outcome: rawOutcome as Outcome,
        callDate: optional(get("Date of Call")),
        investmentCapability: optional(get("Investment Capability $", "Investment Capability")),
        currentSituation: optional(get("Current Situation")),
        desiredSituation: optional(get("Desired Situation")),
        obstacles: optional(get("Obstacles")),
        followUpDate: optional(get("Follow Up Date")),
        followUpReason: optional(get("Follow Up Reason")),
        deposit: optional(get("Deposit (if nothing put 0)", "Deposit")),
        dateWon: optional(get("Date Closed", "Date Won")),
        cashCollected: optional(get("Cash Collected")),
        packageTotal: optional(get("Package Total")),
        financingType: optional(get("Financing Type")),
        paymentPlanMonths: optional(get("Number of Months in Payment Plan", "# Months", "Months")),
        paymentPerPeriod: optional(get("$ per payment period", "Payment per period")),
        dateLost: optional(get("Date Lost")),
        lossReason: optional(get("Reason", "Reason Lost", "Loss Reason")),
        notes: optional(get("Any Additional Info you would like to mention?", "Additional Info", "Notes")),
        submittedAt: Date.now(),
      };
      const recorded = await ctx.runMutation(internal.outcomes.record, input);
      if (!recorded.isDuplicate) {
        await ctx.scheduler.runAfter(0, internal.discord.outcome, {
          name: input.name,
          email: input.email,
          outcome: input.outcome,
          setterName: input.setterName,
          closerName: input.closerName,
          callDate: input.callDate,
          investmentCapability: input.investmentCapability,
          currentSituation: input.currentSituation,
          desiredSituation: input.desiredSituation,
          obstacles: input.obstacles,
          followUpDate: input.followUpDate,
          followUpReason: input.followUpReason,
          deposit: input.deposit,
          dateWon: input.dateWon,
          cashCollected: input.cashCollected,
          packageTotal: input.packageTotal,
          financingType: input.financingType,
          paymentPlanMonths: input.paymentPlanMonths,
          paymentPerPeriod: input.paymentPerPeriod,
          dateLost: input.dateLost,
          lossReason: input.lossReason,
          notes: input.notes,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncOutcome({
            ...input,
          });
          await ctx.runMutation(internal.outcomes.markGhlSync, {
            outcomeId: recorded.outcomeId,
            status: "synced",
            ghlContactId: synced.contactId,
            ghlOpportunityId: synced.opportunityId,
            ghlNoteId: synced.noteId,
          });
        } catch (error) {
          await ctx.runMutation(internal.outcomes.markGhlSync, {
            outcomeId: recorded.outcomeId,
            status: "failed",
            error: errorMessage(error),
          });
        }
      }
      return Response.json({
        outcomeId: recorded.outcomeId,
        duplicate: recorded.isDuplicate,
      }, { status: 201, headers: corsHeaders });
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
      const startTiming = text(body.startTiming ?? body.urgency, "Start timing");
      const investmentReadiness = text(body.investmentReadiness ?? body.liquidCapital, "Investment readiness");
      const whyNow = text(body.whyNow, "Why now");
      if (whyNow.length < 20) throw new Error("Why now must be at least 20 characters.");
      const canInvest = investmentReadiness === "Yes" || investmentReadiness === "Yes, with a payment plan";
      const readySoon = ["Immediately", "Within the next two weeks", "Within 30 days"].includes(startTiming);
      const qualificationStatus = canInvest && readySoon
        ? "qualified" as const
        : "unqualified" as const;
      const input = {
        currentWork: text(body.currentWork, "Current work"),
        currentIncome: text(body.currentIncome, "Current income"),
        incomeGoal: text(body.incomeGoal, "Income goal"),
        experience: text(body.experience, "Sales experience"),
        salesRole: optional(body.salesRole),
        whyNow,
        urgency: startTiming,
        startTiming,
        investmentReadiness,
        name: text(body.name, "Name"),
        email: email(body.email),
        instagram: optional(body.instagram),
        phone: text(body.phone, "Phone"),
        liquidCapital: investmentReadiness,
        qualificationStatus,
        submittedAt: Date.now(),
        landingPage: text(body.landingPage, "Landing page"),
        userAgent: optional(body.userAgent),
        attribution: attribution(body.attribution),
      };
      const recorded = await ctx.runMutation(internal.applications.record, input);
      if (!recorded.isDuplicate) {
        await ctx.scheduler.runAfter(0, internal.discord.application, {
          name: input.name,
          email: input.email,
          phone: input.phone,
          instagram: input.instagram,
          currentWork: input.currentWork,
          currentIncome: input.currentIncome,
          incomeGoal: input.incomeGoal,
          experience: input.experience,
          salesRole: input.salesRole,
          whyNow: input.whyNow,
          startTiming: input.startTiming,
          investmentReadiness: input.investmentReadiness,
          liquidCapital: input.liquidCapital,
          landingPage: input.landingPage,
          qualificationStatus: input.qualificationStatus,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncApplication({
            ...input,
          });
          await ctx.runMutation(internal.applications.markSync, {
            applicationId: recorded.applicationId,
            status: "synced",
            ghlContactId: synced.contactId,
            ghlOpportunityId: synced.opportunityId,
            ghlNoteId: synced.noteId,
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
  path: "/calendar-booked",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    try {
      const body = await request.json();
      if (text(body.calendarId, "Calendar ID") !== mappings.calendar.id) {
        throw new Error("Unknown calendar.");
      }
      const synced = await syncNativeCalendarBooking({
        name: text(body.name, "Name"),
        email: email(body.email),
        phone: optional(body.phone),
        attribution: attribution(body.attribution),
      });
      return Response.json({ synced: true, opportunityId: synced.opportunityId }, { status: 201, headers: corsHeaders });
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
          phone: input.phone,
          callStart: input.callStart,
          timeZone: input.timeZone,
          meetingLink: input.meetingLink,
          setterName: input.setterName,
          closerName: input.closerName,
          attribution: input.attribution,
        });
      }
      if (!recorded.isDuplicate || recorded.syncStatus === "failed") {
        try {
          const synced = await syncBooking({
            ...input,
          });
          await ctx.runMutation(internal.bookings.markSync, {
            bookingId: recorded.bookingId,
            status: "synced",
            ghlContactId: synced.contactId,
            ghlOpportunityId: synced.opportunityId,
            ghlNoteId: synced.noteId,
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
