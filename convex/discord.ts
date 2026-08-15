import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { attributionValidator } from "./applications";

const webhookUrl = () =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.DISCORD_WEBHOOK_URL;

function field(name: string, value: string | undefined, inline = true) {
  return value?.trim() ? { name, value: value.trim().slice(0, 1024), inline } : null;
}

function attributionFields(attribution: {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}) {
  return [
    field("UTM Source", attribution.source),
    field("UTM Medium", attribution.medium),
    field("UTM Campaign", attribution.campaign),
    field("UTM Content", attribution.content),
  ].filter(Boolean);
}

async function send(title: string, fields: Array<ReturnType<typeof field>>) {
  const url = webhookUrl();
  if (!url) return { skipped: true };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "RSA Funnel",
      allowed_mentions: { parse: [] },
      embeds: [{
        title,
        color: 14620454,
        fields: fields.filter(Boolean),
        timestamp: new Date().toISOString(),
      }],
    }),
  });
  if (!response.ok) throw new Error(`Discord notification failed (${response.status}).`);
  return { skipped: false };
}

export const optIn = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("New RSA VSL opt-in", [
    field("Name", args.name),
    field("Email", args.email),
    ...attributionFields(args.attribution),
  ]),
});

export const application = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    instagram: v.string(),
    currentIncome: v.string(),
    liquidCapital: v.string(),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send(
    `New RSA VSL application — ${args.qualificationStatus === "qualified" ? "Qualified" : "Unqualified"}`,
    [
      field("Name", args.name),
      field("Email", args.email),
      field("Phone", args.phone),
      field("Instagram", args.instagram),
      field("Current Income", args.currentIncome),
      field("Investment Capacity", args.liquidCapital),
      ...attributionFields(args.attribution),
    ],
  ),
});

export const booking = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    callStart: v.string(),
    timeZone: v.string(),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("New RSA VSL booking", [
    field("Name", args.name),
    field("Email", args.email),
    field("Call Start", args.callStart),
    field("Time Zone", args.timeZone),
    field("Setter", args.setterName),
    field("Closer", args.closerName),
    ...attributionFields(args.attribution),
  ]),
});
