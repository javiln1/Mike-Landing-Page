import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { attributionValidator } from "./applications";

type WebhookKind = "optIns" | "applications" | "bookings" | "outcomes" | "wins";
type Row = [label: string, value: string | undefined];
type Section = [title: string, rows: Row[]];

const webhookEnvNames: Record<WebhookKind, string> = {
  optIns: "DISCORD_OPTINS_WEBHOOK_URL",
  applications: "DISCORD_APPLICATIONS_WEBHOOK_URL",
  bookings: "DISCORD_BOOKINGS_WEBHOOK_URL",
  outcomes: "DISCORD_OUTCOMES_WEBHOOK_URL",
  wins: "DISCORD_WINS_WEBHOOK_URL",
};

const rsaAvatarUrl = "https://cdn.discordapp.com/icons/1538060651338010754/a127a7f4d77ea32832a38938edadcab8.webp?size=128";

const embedColors: Record<WebhookKind, number> = {
  optIns: 0xe11d2e,
  applications: 0xe11d2e,
  bookings: 0x3b82f6,
  outcomes: 0xf59e0b,
  wins: 0x22c55e,
};

const webhookUrl = (kind: WebhookKind) => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[webhookEnvNames[kind]] ?? env?.DISCORD_WEBHOOK_URL;
};

function safe(value: string) {
  return value.replace(/([\\`*_{}\[\]()#+\-.!|>~])/g, "\\$1").slice(0, 900);
}

function section([title, rows]: Section) {
  const visibleRows = rows.filter(([, value]) => value?.trim());
  if (!visibleRows.length) return "";
  return [
    `**${title}**`,
    ...visibleRows.map(([label, value]) => `• **${label}:** ${safe(value!.trim())}`),
  ].join("\n");
}

function description(sections: Section[]) {
  return sections.map(section).filter(Boolean).join("\n\n").slice(0, 4096);
}

function attributionSection(attribution: {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}): Section {
  return ["Attribution", [
    ["Source", attribution.source ?? "Not Provided"],
    ["Medium", attribution.medium ?? "Not Provided"],
    ["Campaign", attribution.campaign ?? "Not Provided"],
    ["Content", attribution.content ?? "Not Provided"],
  ]];
}

async function send(kind: WebhookKind, title: string, sections: Section[]) {
  const url = webhookUrl(kind);
  if (!url) return { skipped: true };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "RSA Funnel Bot",
      avatar_url: rsaAvatarUrl,
      allowed_mentions: { parse: [] },
      embeds: [{
        title,
        description: description(sections),
        color: embedColors[kind],
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
    landingPage: v.string(),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("optIns", "🧲 RSA VSL Opt-In", [
    ["Contact", [
      ["Name", args.name],
      ["Email", args.email],
    ]],
    attributionSection(args.attribution),
    ["Funnel", [
      ["Source", "Remote Sales Academy VSL"],
      ["Page", args.landingPage],
    ]],
  ]),
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
    salesRole: v.optional(v.string()),
    startTiming: v.string(),
    investmentReadiness: v.string(),
    liquidCapital: v.string(),
    landingPage: v.string(),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send(
    "applications",
    "📝 RSA Application — Ready to Book",
    [
      ["Contact", [
        ["Name", args.name],
        ["Email", args.email],
        ["Phone", args.phone],
        ["Instagram", args.instagram],
      ]],
      ["Application", [
        ["Current Situation", args.currentWork],
        ["Sales Experience", args.experience],
        ["Sales Role", args.salesRole],
        ["Current Monthly Income", args.currentIncome],
        ["3–6 Month Income Goal", args.incomeGoal],
        ["Ready to Begin", args.startTiming],
        ["Investment Range", args.investmentReadiness],
      ]],
      attributionSection(args.attribution),
      ["Funnel", [
        ["Source", "Remote Sales Academy VSL"],
        ["Page", args.landingPage],
      ]],
    ],
  ),
});

export const booking = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    callStart: v.string(),
    timeZone: v.string(),
    meetingLink: v.string(),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    attribution: attributionValidator,
  },
  handler: async (_ctx, args) => send("bookings", "📅 RSA Call Booking", [
    ["Contact", [
      ["Name", args.name],
      ["Email", args.email],
      ["Phone", args.phone],
    ]],
    ["Booking", [
      ["Date & Time", args.callStart],
      ["Time Zone", args.timeZone],
      ["Setter", args.setterName],
      ["Closer", args.closerName],
      ["Meeting Link", args.meetingLink],
    ]],
    attributionSection(args.attribution),
    ["Funnel", [
      ["Source", "RSA Calendar"],
    ]],
  ]),
});

export const outcome = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    outcome: v.union(
      v.literal("Deal Closed"),
      v.literal("Deal Lost"),
    ),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    callDate: v.optional(v.string()),
    investmentCapability: v.optional(v.string()),
    currentSituation: v.optional(v.string()),
    desiredSituation: v.optional(v.string()),
    obstacles: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    followUpReason: v.optional(v.string()),
    deposit: v.optional(v.string()),
    dateWon: v.optional(v.string()),
    cashCollected: v.optional(v.string()),
    packageTotal: v.optional(v.string()),
    financingType: v.optional(v.string()),
    paymentPlanMonths: v.optional(v.string()),
    paymentPerPeriod: v.optional(v.string()),
    dateLost: v.optional(v.string()),
    lossReason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (_ctx, args) => send(
    args.outcome === "Deal Closed" ? "wins" : "outcomes",
    args.outcome === "Deal Closed" ? "🏆 RSA Deal Closed" : "📞 RSA Call Outcome — Deal Lost",
    [
      ["Contact", [
        ["Name", args.name],
        ["Email", args.email],
      ]],
      ["Call", [
        ["Outcome", args.outcome],
        ["Call Date", args.callDate],
        ["Setter", args.setterName],
        ["Closer", args.closerName],
      ]],
      ["Lead Context", [
        ["Investment Capability", args.investmentCapability],
        ["Current Situation", args.currentSituation],
        ["Desired Situation", args.desiredSituation],
        ["Obstacles", args.obstacles],
      ]],
      ["Follow-Up", [
        ["Date", args.followUpDate],
        ["Reason", args.followUpReason],
        ["Deposit", args.deposit],
      ]],
      ["Revenue", [
        ["Date Won", args.dateWon],
        ["Cash Collected", args.cashCollected],
        ["Package Total", args.packageTotal],
        ["Financing Type", args.financingType],
        ["Payment Plan Months", args.paymentPlanMonths],
        ["Payment Per Period", args.paymentPerPeriod],
      ]],
      ["Notes", [
        ["Date Lost", args.dateLost],
        ["Loss Reason", args.lossReason],
        ["Additional Info", args.notes],
      ]],
    ],
  ),
});
