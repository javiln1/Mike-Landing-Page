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
    ghlContactId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
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
    salesRole: v.optional(v.string()),
    whyNow: v.optional(v.string()),
    urgency: v.string(),
    startTiming: v.optional(v.string()),
    investmentReadiness: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    instagram: v.optional(v.string()),
    phone: v.string(),
    liquidCapital: v.string(),
    nonMarketingConsent: v.optional(v.boolean()),
    marketingConsent: v.optional(v.boolean()),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    submittedAt: v.number(),
    landingPage: v.string(),
    userAgent: v.optional(v.string()),
    attribution,
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    ghlContactId: v.optional(v.string()),
    ghlOpportunityId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
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
    ghlContactId: v.optional(v.string()),
    ghlOpportunityId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
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
      v.literal("Deal Closed"),
      v.literal("Deal Lost"),
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
    closeActivityId: v.optional(v.string()),
    ghlContactId: v.optional(v.string()),
    ghlOpportunityId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
    syncStatus,
    syncError: v.optional(v.string()),
  })
    .index("by_submission_key", ["submissionKey"])
    .index("by_email", ["email"])
    .index("by_submission", ["submittedAt"]),
});
