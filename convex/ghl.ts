import mappings from "../config/ghl-mappings.json";

type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

type CustomField = { id: string; fieldValue: string };

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function money(value: unknown) {
  const cleaned = clean(value);
  if (!cleaned) return undefined;
  const amount = Number(cleaned.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? amount : undefined;
}

function field(fields: CustomField[], id: string, value: unknown) {
  const cleaned = clean(value);
  if (cleaned) fields.push({ id, fieldValue: cleaned });
}

function attributionFields(attribution: Attribution) {
  const fields: CustomField[] = [];
  field(fields, mappings.contactFields.utmSource, attribution.source);
  field(fields, mappings.contactFields.utmMedium, attribution.medium);
  field(fields, mappings.contactFields.utmCampaign, attribution.campaign);
  field(fields, mappings.contactFields.utmContent, attribution.content);
  return fields;
}

function env(name: "GHL_PRIVATE_INTEGRATION_TOKEN" | "GHL_LOCATION_ID") {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

async function ghlRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${env("GHL_PRIVATE_INTEGRATION_TOKEN")}`);
  headers.set("Version", "v3");
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(`https://services.leadconnectorhq.com${path}`, { ...init, headers });
    const responseText = await response.text();
    let data: any = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }
    if (response.ok) return data;
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
    const detail = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(`GHL ${path} failed (${response.status})${detail ? `: ${String(detail).slice(0, 250)}` : "."}`);
  }
  throw new Error(`GHL ${path} failed.`);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts.shift() || name,
    lastName: parts.join(" ") || undefined,
  };
}

async function upsertContact(input: {
  name: string;
  email: string;
  phone?: string;
  customFields?: CustomField[];
}) {
  const names = splitName(input.name);
  const data = await ghlRequest("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify({
      locationId: env("GHL_LOCATION_ID"),
      ...names,
      name: input.name,
      email: input.email,
      phone: clean(input.phone),
      source: "RSA VSL Funnel",
      customFields: input.customFields || [],
    }),
  });
  const contactId = data.contact?.id || data.id;
  if (!contactId) throw new Error("GHL contact upsert returned no contact ID.");
  return contactId as string;
}

async function addTags(contactId: string, tags: string[]) {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
}

async function addNote(contactId: string, title: string, values: Array<[string, unknown]>) {
  const lines = values
    .map(([label, value]) => [label, clean(value)] as const)
    .filter((item): item is readonly [string, string] => Boolean(item[1]))
    .map(([label, value]) => `${label}: ${value}`);
  const data = await ghlRequest(`/contacts/${contactId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body: [title, ...lines].join("\n") }),
  });
  return (data.note?.id || data.id) as string | undefined;
}

async function upsertOpportunity(input: {
  contactId: string;
  name: string;
  stageId: string;
  status?: "open" | "won" | "lost";
  monetaryValue?: number;
  customFields?: CustomField[];
}) {
  const data = await ghlRequest("/opportunities/upsert", {
    method: "POST",
    body: JSON.stringify({
      locationId: env("GHL_LOCATION_ID"),
      pipelineId: mappings.pipeline.id,
      pipelineStageId: input.stageId,
      contactId: input.contactId,
      name: `${input.name} — RSA VSL`,
      status: input.status || "open",
      monetaryValue: input.monetaryValue,
      customFields: input.customFields || [],
    }),
  });
  const opportunityId = data.opportunity?.id || data.id;
  if (!opportunityId) throw new Error("GHL opportunity upsert returned no opportunity ID.");
  return opportunityId as string;
}

export async function syncOptIn(input: {
  name: string;
  email: string;
  landingPage: string;
  attribution: Attribution;
}) {
  const customFields = attributionFields(input.attribution);
  field(customFields, mappings.contactFields.landingPage, input.landingPage);
  const contactId = await upsertContact({ ...input, customFields });
  await addTags(contactId, ["rsa-vsl", "rsa-opt-in"]);
  const noteId = await addNote(contactId, "RSA VSL — Opt-in", [
    ["Landing page", input.landingPage],
    ["UTM source", input.attribution.source],
    ["UTM medium", input.attribution.medium],
    ["UTM campaign", input.attribution.campaign],
    ["UTM content", input.attribution.content],
  ]);
  return { contactId, noteId };
}

export async function syncApplication(input: {
  currentWork: string;
  currentIncome: string;
  incomeGoal: string;
  experience: string;
  salesRole?: string;
  urgency: string;
  startTiming: string;
  investmentReadiness: string;
  name: string;
  email: string;
  instagram?: string;
  phone: string;
  liquidCapital: string;
  qualificationStatus: "qualified" | "unqualified";
  landingPage: string;
  attribution: Attribution;
}) {
  const qualification = input.qualificationStatus === "qualified" ? "Qualified" : "Unqualified";
  const customFields = attributionFields(input.attribution);
  field(customFields, mappings.contactFields.instagram, input.instagram);
  field(customFields, mappings.contactFields.qualification, qualification);
  field(customFields, mappings.contactFields.currentWork, input.currentWork);
  field(customFields, mappings.contactFields.currentIncome, input.currentIncome);
  field(customFields, mappings.contactFields.incomeGoal, input.incomeGoal);
  field(customFields, mappings.contactFields.salesExperience, input.experience);
  field(customFields, mappings.contactFields.salesRole, input.salesRole);
  field(customFields, mappings.contactFields.startTiming, input.startTiming);
  field(customFields, mappings.contactFields.investmentReadiness, input.investmentReadiness);
  field(customFields, mappings.contactFields.landingPage, input.landingPage);
  const contactId = await upsertContact({ ...input, customFields });
  await addTags(contactId, ["rsa-vsl", "rsa-application", `rsa-${input.qualificationStatus}`]);
  const opportunityId = await upsertOpportunity({
    contactId,
    name: input.name,
    stageId: input.qualificationStatus === "qualified"
      ? mappings.pipeline.stages.qualified
      : mappings.pipeline.stages.dealLost,
    status: input.qualificationStatus === "qualified" ? "open" : "lost",
  });
  const noteId = await addNote(contactId, "RSA VSL — Application", [
    ["Qualification", qualification],
    ["Current work", input.currentWork],
    ["Current income", input.currentIncome],
    ["Income goal", input.incomeGoal],
    ["Sales experience", input.experience],
    ["Sales role", input.salesRole],
    ["Start timing", input.startTiming],
    ["Investment range", input.investmentReadiness],
    ["Instagram", input.instagram],
  ]);
  return { contactId, opportunityId, noteId };
}

export async function syncBooking(input: {
  name: string;
  email: string;
  phone?: string;
  callStart: string;
  timeZone: string;
  meetingLink: string;
  setterName?: string;
  closerName?: string;
  attribution: Attribution;
}) {
  const customFields = attributionFields(input.attribution);
  field(customFields, mappings.contactFields.setterName, input.setterName);
  field(customFields, mappings.contactFields.closerName, input.closerName);
  const contactId = await upsertContact({ ...input, customFields });
  await addTags(contactId, ["rsa-vsl", "rsa-booked"]);
  const opportunityId = await upsertOpportunity({
    contactId,
    name: input.name,
    stageId: mappings.pipeline.stages.booked,
  });
  const noteId = await addNote(contactId, "RSA VSL — Booking", [
    ["Call start", input.callStart],
    ["Time zone", input.timeZone],
    ["Meeting link", input.meetingLink],
    ["Setter", input.setterName],
    ["Closer", input.closerName],
  ]);
  return { contactId, opportunityId, noteId };
}

export async function syncNativeCalendarBooking(input: {
  name: string;
  email: string;
  phone?: string;
  attribution: Attribution;
}) {
  const contactId = await upsertContact({
    ...input,
    customFields: attributionFields(input.attribution),
  });
  await addTags(contactId, ["rsa-vsl", "rsa-booked"]);
  const opportunityId = await upsertOpportunity({
    contactId,
    name: input.name,
    stageId: mappings.pipeline.stages.booked,
  });
  const noteId = await addNote(contactId, "RSA VSL — GHL calendar booking", [
    ["Calendar", "RSA Application Call"],
  ]);
  return { contactId, opportunityId, noteId };
}

const outcomeStages = {
  "Deal Closed": mappings.pipeline.stages.dealClosed,
  "Deal Lost": mappings.pipeline.stages.dealLost,
} as const;

const normalizedOutcomes = {
  "Deal Closed": "Deal Closed",
  "Deal Lost": "Deal Lost",
} as const;

export async function syncOutcome(input: {
  name: string;
  email: string;
  setterName?: string;
  closerName?: string;
  outcome: keyof typeof outcomeStages;
  callDate?: string;
  investmentCapability?: string;
  currentSituation?: string;
  desiredSituation?: string;
  obstacles?: string;
  followUpDate?: string;
  followUpReason?: string;
  deposit?: string;
  dateWon?: string;
  cashCollected?: string;
  packageTotal?: string;
  financingType?: string;
  paymentPlanMonths?: string;
  paymentPerPeriod?: string;
  dateLost?: string;
  lossReason?: string;
  notes?: string;
}) {
  const contactFields: CustomField[] = [];
  field(contactFields, mappings.contactFields.setterName, input.setterName);
  field(contactFields, mappings.contactFields.closerName, input.closerName);
  const contactId = await upsertContact({ ...input, customFields: contactFields });
  const normalized = normalizedOutcomes[input.outcome];
  const opportunityFields: CustomField[] = [];
  field(opportunityFields, mappings.opportunityFields.outcome, normalized);
  field(opportunityFields, mappings.opportunityFields.callDate, input.callDate);
  field(opportunityFields, mappings.opportunityFields.investmentCapability, input.investmentCapability);
  field(opportunityFields, mappings.opportunityFields.currentSituation, input.currentSituation);
  field(opportunityFields, mappings.opportunityFields.desiredSituation, input.desiredSituation);
  field(opportunityFields, mappings.opportunityFields.obstacles, input.obstacles);
  field(opportunityFields, mappings.opportunityFields.followUpDate, input.followUpDate);
  field(opportunityFields, mappings.opportunityFields.followUpReason, input.followUpReason);
  field(opportunityFields, mappings.opportunityFields.deposit, input.deposit);
  field(opportunityFields, mappings.opportunityFields.dateClosed, input.dateWon);
  field(opportunityFields, mappings.opportunityFields.cashCollected, input.cashCollected);
  field(opportunityFields, mappings.opportunityFields.packageTotal, input.packageTotal);
  field(opportunityFields, mappings.opportunityFields.financingType, input.financingType);
  field(opportunityFields, mappings.opportunityFields.paymentPlanMonths, input.paymentPlanMonths);
  field(opportunityFields, mappings.opportunityFields.paymentPerPeriod, input.paymentPerPeriod);
  field(opportunityFields, mappings.opportunityFields.dateLost, input.dateLost);
  field(opportunityFields, mappings.opportunityFields.lossReason, input.lossReason);
  field(opportunityFields, mappings.opportunityFields.notes, input.notes);
  const status = normalized === "Deal Closed" ? "won" : "lost";
  const opportunityId = await upsertOpportunity({
    contactId,
    name: input.name,
    stageId: outcomeStages[input.outcome],
    status,
    monetaryValue: money(input.cashCollected) ?? money(input.packageTotal),
    customFields: opportunityFields,
  });
  await addTags(contactId, ["rsa-vsl", `rsa-outcome-${normalized.toLowerCase().replaceAll(" ", "-")}`]);
  const noteId = await addNote(contactId, "RSA VSL — Outcome", [
    ["Outcome", normalized],
    ["Call date", input.callDate],
    ["Setter", input.setterName],
    ["Closer", input.closerName],
    ["Investment capability", input.investmentCapability],
    ["Current situation", input.currentSituation],
    ["Desired situation", input.desiredSituation],
    ["Obstacles", input.obstacles],
    ["Follow-up date", input.followUpDate],
    ["Follow-up reason", input.followUpReason],
    ["Deposit", input.deposit],
    ["Date closed", input.dateWon],
    ["Cash collected", input.cashCollected],
    ["Package total", input.packageTotal],
    ["Financing type", input.financingType],
    ["Payment plan months", input.paymentPlanMonths],
    ["Payment per period", input.paymentPerPeriod],
    ["Date lost", input.dateLost],
    ["Loss reason", input.lossReason],
    ["Notes", input.notes],
  ]);
  return { contactId, opportunityId, noteId };
}
