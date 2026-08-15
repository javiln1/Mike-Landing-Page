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
});
