import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const attribution = v.object({
  source: v.optional(v.string()),
  medium: v.optional(v.string()),
  campaign: v.optional(v.string()),
  content: v.optional(v.string()),
});

const syncStatus = v.union(
  v.literal("pending"),
  v.literal("synced"),
  v.literal("failed"),
);

export default defineSchema({
  optIns: defineTable({
    name: v.string(),
    email: v.string(),
    submittedAt: v.number(),
    landingPage: v.string(),
    userAgent: v.optional(v.string()),
    attribution,
    closeLeadId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    syncStatus,
    syncError: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_submission", ["submittedAt"]),

  applications: defineTable({
    currentWork: v.string(),
    currentIncome: v.string(),
    incomeGoal: v.string(),
    experience: v.string(),
    urgency: v.string(),
    name: v.string(),
    email: v.string(),
    instagram: v.string(),
    phone: v.string(),
    liquidCapital: v.string(),
    nonMarketingConsent: v.boolean(),
    marketingConsent: v.boolean(),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    submittedAt: v.number(),
    landingPage: v.string(),
    userAgent: v.optional(v.string()),
    attribution,
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    syncStatus,
    syncError: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_submission", ["submittedAt"]),

  bookings: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    callStart: v.string(),
    timeZone: v.string(),
    meetingLink: v.string(),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    submittedAt: v.number(),
    attribution,
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    syncStatus,
    syncError: v.optional(v.string()),
  })
    .index("by_email_start", ["email", "callStart"])
    .index("by_submission", ["submittedAt"]),

  outcomes: defineTable({
    submissionKey: v.string(),
    name: v.string(),
    email: v.string(),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    outcome: v.union(
      v.literal("Deal Won"),
      v.literal("Follow Up"),
      v.literal("Deal Lost"),
      v.literal("No Show"),
      v.literal("Rescheduled"),
      v.literal("Disqualified"),
      v.literal("Not Contacted"),
    ),
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
    submittedAt: v.number(),
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    syncStatus,
    syncError: v.optional(v.string()),
  })
    .index("by_submission_key", ["submissionKey"])
    .index("by_email", ["email"])
    .index("by_submission", ["submittedAt"]),
});
