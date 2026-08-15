import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { attributionValidator } from "./applications";

type WebhookKind = "optIns" | "applications" | "bookings" | "outcomes" | "wins";

const webhookEnvNames: Record<WebhookKind, string> = {
  optIns: "DISCORD_OPTINS_WEBHOOK_URL",
  applications: "DISCORD_APPLICATIONS_WEBHOOK_URL",
  bookings: "DISCORD_BOOKINGS_WEBHOOK_URL",
  outcomes: "DISCORD_OUTCOMES_WEBHOOK_URL",
  wins: "DISCORD_WINS_WEBHOOK_URL",
};

const rsaAvatarUrl = "https://cdn.discordapp.com/icons/1538060651338010754/a127a7f4d77ea32832a38938edadcab8.webp?size=128";

const embedStyles: Record<WebhookKind, { color: number; label: string }> = {
  optIns: { color: 0xe11d2e, label: "NEW OPT-IN" },
  applications: { color: 0xe11d2e, label: "NEW APPLICATION" },
  bookings: { color: 0x3b82f6, label: "CALL BOOKED" },
  outcomes: { color: 0xf59e0b, label: "CALL OUTCOME" },
  wins: { color: 0x22c55e, label: "DEAL WON" },
};

const webhookUrl = (kind: WebhookKind) => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[webhookEnvNames[kind]] ?? env?.DISCORD_WEBHOOK_URL;
};

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

async function send(kind: WebhookKind, title: string, fields: Array<ReturnType<typeof field>>) {
  const url = webhookUrl(kind);
  if (!url) return { skipped: true };
  const style = embedStyles[kind];
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "RSA Funnel",
      avatar_url: rsaAvatarUrl,
      allowed_mentions: { parse: [] },
      embeds: [{
        author: {
          name: `REMOTE SALES ACADEMY  •  ${style.label}`,
          icon_url: rsaAvatarUrl,
        },
        title,
        color: style.color,
        fields: fields.filter(Boolean),
        footer: {
          text: "RSA  •  Funnel Operations",
          icon_url: rsaAvatarUrl,
        },
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
  handler: async (_ctx, args) => send("optIns", "New RSA VSL opt-in", [
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
    "applications",
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
  handler: async (_ctx, args) => send("bookings", "New RSA VSL booking", [
    field("Name", args.name),
    field("Email", args.email),
    field("Call Start", args.callStart),
    field("Time Zone", args.timeZone),
    field("Setter", args.setterName),
    field("Closer", args.closerName),
    ...attributionFields(args.attribution),
  ]),
});

export const outcome = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    outcome: v.union(
      v.literal("Deal Closed"),
      v.literal("Deal Won"),
      v.literal("Follow Up"),
      v.literal("Deal Lost"),
      v.literal("No Show"),
      v.literal("Disqualified"),
      v.literal("Not Contacted"),
    ),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    callDate: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    followUpReason: v.optional(v.string()),
    cashCollected: v.optional(v.string()),
    packageTotal: v.optional(v.string()),
    lossReason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (_ctx, args) => send(
    args.outcome === "Deal Won" ? "wins" : "outcomes",
    args.outcome === "Deal Won" ? "RSA deal won" : `RSA call outcome — ${args.outcome}`,
    [
      field("Name", args.name),
      field("Email", args.email),
      field("Outcome", args.outcome),
      field("Setter", args.setterName),
      field("Closer", args.closerName),
      field("Call Date", args.callDate),
      field("Follow-up Date", args.followUpDate),
      field("Follow-up Reason", args.followUpReason, false),
      field("Cash Collected", args.cashCollected),
      field("Package Total", args.packageTotal),
      field("Loss Reason", args.lossReason, false),
      field("Notes", args.notes, false),
    ],
  ),
});
