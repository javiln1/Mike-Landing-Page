import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { attributionValidator } from "./applications";

type SheetEvent = "optIn" | "application" | "booking";

function env(name: "SHEETS_WEBHOOK_URL" | "SHEETS_WEBHOOK_TOKEN") {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

async function send(eventType: SheetEvent, payload: Record<string, unknown>) {
  const response = await fetch(env("SHEETS_WEBHOOK_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env("SHEETS_WEBHOOK_TOKEN"),
      eventType,
      ...payload,
    }),
    redirect: "follow",
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Sheets webhook failed (${response.status}).`);
  if (responseText) {
    const result = JSON.parse(responseText) as { ok?: boolean; error?: string };
    if (!result.ok) throw new Error(result.error || "Sheets webhook rejected the event.");
  }
}

export const optIn = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    landingPage: v.string(),
    submittedAt: v.number(),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("optIn", args),
});

export const application = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    instagram: v.optional(v.string()),
    currentWork: v.string(),
    currentIncome: v.string(),
    incomeGoal: v.string(),
    experience: v.string(),
    startTiming: v.string(),
    investmentReadiness: v.string(),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    whyNow: v.string(),
    submittedAt: v.number(),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("application", args),
});

export const booking = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    callStart: v.optional(v.string()),
    timeZone: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    closerName: v.optional(v.string()),
    submittedAt: v.number(),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("booking", args),
});
