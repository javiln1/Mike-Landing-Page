type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

const config = {
  sharedUserId: "user_oKUouqfUCk7U0VxKO776S3oXgzwn63w2Uq2Qxh31Inv",
  leadStatusId: "stat_lvdspqnNnIrvBSgwuvuLFf2DsDLyE200X817s5sZw90",
  pipelineId: "pipe_70643oVvRscqCsOCWeNl4F",
  stages: {
    qualified: "stat_1z9L9wXq6S0SsPucjOg3VRynagWtC5DCFvqNOqmFgQn",
    booked: "stat_vIaBDLggA7DSjUDxqz1e8eHAboaVknZZ31dpX3efsZA",
    disqualified: "stat_kS3RkkhBtJ5pQs1AhiQ41YNVfZBt32N5xzlO2KqwHRc",
  },
  leadFields: {
    setterName: "cf_0JtHxMeHX6pe2F5ZOLSaOFZfS5GEsrDRhRe7Sdrdf2D",
    closerName: "cf_7WIrzPuafHOi54DJ5ixeIfGrQvwh8LdgjIDtAGtckA3",
    instagram: "cf_XcxkLFNmO0DsbM5dI3ecRmtbfpZbuUEmr1thJ6rEDba",
    qualification: "cf_ROPEem9oRhZVWTw1e7EOwGBSgvqPT70JIstuidIYK8U",
    utmSource: "cf_ATtDHAofBP7hF9d27jnkTbBZ2AjdTXeOCJsB8vKWaPV",
    utmMedium: "cf_sYgGbUpBRZ7AhTGrhZrxSq4IUkAcUCX1KVZXxC5X1qR",
    utmCampaign: "cf_DUC5bbujzngGwYzKpjjg3Tdo3A7Sdv9sJa0pp7dFYy2",
    utmContent: "cf_7bIX6hpCQc7CiqRLD8JUAAChGOTiiJa8BEzd31tCzkQ",
  },
  activities: {
    optIn: {
      typeId: "actitype_1tcP55ePBlYbLEM8Lk2Jyq",
      fields: {
        setterName: "cf_LaoyfBF3JZvCBZV5pok2yBBIxXo6elasn0f5gJZ1uce",
        closerName: "cf_WLzJxtwwY5GlaRizHp7ULNHLjC0bZPfyj9vt3PpP4C1",
        landingPage: "cf_y16r111Uo2GtA4E2iUWa9gtcXoOYFiQQYBg7GU5ELCN",
        utmSource: "cf_DW07rVVynXErOQ97W6BBQHRG7wa2GAQvQSvpUP2wzvK",
        utmMedium: "cf_bj2GNjDPPHBMR49F9nZMPlmq7iQf2emuXyTG3qlfxAf",
        utmCampaign: "cf_WMhctKdKOn8Ty7bJv2JI3XqzX3CYzwAdCujv9SYKudF",
        utmContent: "cf_UPCRPJa0PVBOzStAkEturxRO2m077srlhr0pyoFrX7c",
      },
    },
    application: {
      typeId: "actitype_0PtrnHLsO29xYnI7qICDEK",
      fields: {
        setterName: "cf_mnl8mIjEDStdXaj0eDZhbIt9mY82AyG5MC4PevrO4Lf",
        closerName: "cf_JRAbmqqSgmvwJYOLqtHCMVKySbWhvRTfFNhLVRTFXQd",
        qualification: "cf_7YNNx7ggA0Jwmo8JUco2xcx2lobNG2B0VBMnaNd4zCX",
        currentWork: "cf_w6Lsvby411BveI1gmtjd5ORTOT8ZkAR59Myrk9akb94",
        currentIncome: "cf_E98JpVm6kPqdRO5G7sdBbkImuPRWcs48OgSNonLNXYj",
        incomeGoal: "cf_GJbtnk041ExCMecEq7HtCElVH2UgmYDZBkYMr3tZoma",
        salesExperience: "cf_QjfSKu9ofYECVoYJYKN2uWgSYV8UD1nEKsZSmS1jAsq",
        urgency: "cf_Gemx4Qq20BIS5EN8itS8891twiDT6rVN76uVRS0qYIL",
        instagram: "cf_E8fzQjqzpH88nk3Ij9xH7be2VJdKlKfAAbpLZhorKw0",
        investmentCapacity: "cf_xQ7kOddIE2eimjsGjWXAyYKOAIVvSoyvuyRxi4rW2LA",
        utmSource: "cf_waGDLwdccAlIzpsTyePVINX0bDyLGiFAzTfS321Q1vX",
        utmMedium: "cf_JMSgKTitJa1uLp04qcxHonsmhy2llaCuR1mfSEaQkiQ",
        utmCampaign: "cf_KtiT1DFRic79Aumo2cTUnjwvyTP9ytXBqjCx65TDaW5",
        utmContent: "cf_QXt2kNevFaa6oMH924t2DRPwXaxMUKhGXKwtyYqYnBx",
      },
    },
    booking: {
      typeId: "actitype_05o516AyJAFV4sM02kyASC",
      fields: {
        setterName: "cf_HzD9fsH9yCDacVvhlKVkM86F0nUNuoTTolTqYkePHu3",
        closerName: "cf_2MjXvaorimVO5wIM0MaReHnDGMVEWWNvcxpTS8dRfPl",
        callStart: "cf_MZOzxBn58WR8LBXtrgIJiSi9QO42XN9begz4xZOIH9c",
        timeZone: "cf_YuEgUFm6obY3Ef7jDggUurumExlZVrDdMEZLfE681Jn",
        meetingLink: "cf_5D5qmqSTFV2PNaxnB9nD8t42FVmah1wULSeAWR0zZq0",
        utmSource: "cf_UyHgA13EFI9pPoMdohkBp2mRU11fPjwthm98adBTjDk",
        utmMedium: "cf_YT30l4qXjINm77UK1bSWmylGkMrwXXllTOeFAivdPdA",
        utmCampaign: "cf_SG6R3MfRczKJf7rnlrxT6YIBDaWQolWgWPIgPEcIf9a",
        utmContent: "cf_2pweA9S5vuWJSZHrawTpmdHEjAqSTAsQuR4Gkw9eJ7s",
      },
    },
  },
} as const;

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function custom(body: Record<string, unknown>, fieldId: string, value: unknown) {
  const cleaned = clean(value);
  if (cleaned) body[`custom.${fieldId}`] = cleaned;
}

function addAttribution(body: Record<string, unknown>, fields: Record<string, string>, attribution: Attribution) {
  custom(body, fields.utmSource, attribution.source);
  custom(body, fields.utmMedium, attribution.medium);
  custom(body, fields.utmCampaign, attribution.campaign);
  custom(body, fields.utmContent, attribution.content);
}

async function closeRequest(path: string, init: RequestInit = {}) {
  const apiKey = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.CLOSE_API_KEY;
  if (!apiKey) throw new Error("CLOSE_API_KEY is not configured.");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Basic ${btoa(`${apiKey}:`)}`);
  if (init.body) headers.set("Content-Type", "application/json");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(`https://api.close.com/api/v1/${path}`, { ...init, headers });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (response.ok) return data;
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
    throw new Error(`Close ${path} failed (${response.status}).`);
  }
  throw new Error(`Close ${path} failed.`);
}

async function findLead(email: string) {
  const query = encodeURIComponent(`email:\"${email.replaceAll('"', '')}\"`);
  const result = await closeRequest(`lead/?query=${query}&_limit=20`);
  return (result.data || []).find((lead: any) =>
    (lead.contacts || []).some((contact: any) =>
      (contact.emails || []).some((item: any) => item.email?.toLowerCase() === email),
    ),
  );
}

async function ensureLead(input: {
  closeLeadId?: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  qualification?: "Qualified" | "Unqualified";
  setterName?: string;
  closerName?: string;
  attribution: Attribution;
}) {
  let lead = input.closeLeadId ? { id: input.closeLeadId } : await findLead(input.email);
  const body: Record<string, unknown> = { status_id: config.leadStatusId };
  custom(body, config.leadFields.setterName, input.setterName);
  custom(body, config.leadFields.closerName, input.closerName);
  custom(body, config.leadFields.instagram, input.instagram);
  custom(body, config.leadFields.qualification, input.qualification);
  addAttribution(body, config.leadFields, input.attribution);

  if (lead) {
    await closeRequest(`lead/${lead.id}/`, { method: "PUT", body: JSON.stringify(body) });
    return lead.id as string;
  }

  const contact: Record<string, unknown> = {
    name: input.name,
    emails: [{ email: input.email, type: "office" }],
  };
  if (clean(input.phone)) contact.phones = [{ phone: input.phone!.trim(), type: "mobile" }];
  const created = await closeRequest("lead/", {
    method: "POST",
    body: JSON.stringify({ ...body, name: input.name, contacts: [contact] }),
  });
  return created.id as string;
}

async function createActivity(
  leadId: string,
  activity: { typeId: string; fields: Record<string, string> },
  values: Record<string, unknown>,
) {
  const body: Record<string, unknown> = {
    lead_id: leadId,
    custom_activity_type_id: activity.typeId,
    status: "published",
  };
  for (const [name, value] of Object.entries(values)) {
    const fieldId = activity.fields[name];
    if (fieldId) custom(body, fieldId, value);
  }
  const created = await closeRequest("activity/custom/", { method: "POST", body: JSON.stringify(body) });
  return created.id as string;
}

async function ensureOpportunity(leadId: string, statusId: string, opportunityId?: string) {
  if (opportunityId) {
    await closeRequest(`opportunity/${opportunityId}/`, {
      method: "PUT",
      body: JSON.stringify({ status_id: statusId }),
    });
    return opportunityId;
  }
  const list = await closeRequest(`opportunity/?lead_id=${encodeURIComponent(leadId)}&_limit=100`);
  const existing = (list.data || []).find((item: any) => item.pipeline_id === config.pipelineId);
  if (existing) {
    await closeRequest(`opportunity/${existing.id}/`, {
      method: "PUT",
      body: JSON.stringify({ status_id: statusId }),
    });
    return existing.id as string;
  }
  const created = await closeRequest("opportunity/", {
    method: "POST",
    body: JSON.stringify({
      lead_id: leadId,
      pipeline_id: config.pipelineId,
      status_id: statusId,
      value: 0,
      value_period: "one_time",
      user_id: config.sharedUserId,
    }),
  });
  return created.id as string;
}

export async function syncOptIn(input: {
  name: string;
  email: string;
  landingPage: string;
  attribution: Attribution;
}) {
  const leadId = await ensureLead({ ...input, attribution: input.attribution });
  const fields = config.activities.optIn.fields;
  const activityId = await createActivity(leadId, config.activities.optIn, {
    landingPage: input.landingPage,
    utmSource: input.attribution.source,
    utmMedium: input.attribution.medium,
    utmCampaign: input.attribution.campaign,
    utmContent: input.attribution.content,
  });
  return { leadId, activityId, fields };
}

export async function syncApplication(input: {
  closeLeadId?: string;
  closeOpportunityId?: string;
  currentWork: string;
  currentIncome: string;
  incomeGoal: string;
  experience: string;
  urgency: string;
  name: string;
  email: string;
  instagram: string;
  phone: string;
  liquidCapital: string;
  qualificationStatus: "qualified" | "unqualified";
  attribution: Attribution;
}) {
  const qualification = input.qualificationStatus === "qualified" ? "Qualified" : "Unqualified";
  const leadId = await ensureLead({
    ...input,
    qualification,
    attribution: input.attribution,
  });
  const opportunityId = await ensureOpportunity(
    leadId,
    input.qualificationStatus === "qualified" ? config.stages.qualified : config.stages.disqualified,
    input.closeOpportunityId,
  );
  const activityId = await createActivity(leadId, config.activities.application, {
    qualification,
    currentWork: input.currentWork,
    currentIncome: input.currentIncome,
    incomeGoal: input.incomeGoal,
    salesExperience: input.experience,
    urgency: input.urgency,
    instagram: input.instagram,
    investmentCapacity: input.liquidCapital,
    utmSource: input.attribution.source,
    utmMedium: input.attribution.medium,
    utmCampaign: input.attribution.campaign,
    utmContent: input.attribution.content,
  });
  return { leadId, opportunityId, activityId };
}

export async function syncBooking(input: {
  closeLeadId?: string;
  closeOpportunityId?: string;
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
  const leadId = await ensureLead({ ...input, attribution: input.attribution });
  const opportunityId = await ensureOpportunity(leadId, config.stages.booked, input.closeOpportunityId);
  const activityId = await createActivity(leadId, config.activities.booking, {
    setterName: input.setterName,
    closerName: input.closerName,
    callStart: input.callStart,
    timeZone: input.timeZone,
    meetingLink: input.meetingLink,
    utmSource: input.attribution.source,
    utmMedium: input.attribution.medium,
    utmCampaign: input.attribution.campaign,
    utmContent: input.attribution.content,
  });
  return { leadId, opportunityId, activityId };
}
