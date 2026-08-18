# RSA — SMS & Email Sequences

What is actually built in GHL, and the copy of record. Built 2026-08-18 from Mike's spec.

**Sending number:** +44 7460 091307 — confirmed as the account's default SMS number (UK KYC linked), and the same number the team calls from. Text and call are one identity, so "save this number" works literally.

---

## Workflow A — "RSA — Applied, Not Booked"

Catches people who apply but do not book.

```
Trigger: Contact tag added includes "rsa-application"
  -> Wait 15 minutes
  -> If/Else "Not booked yet"
       Branch: Tags does not include "rsa-booked"
         -> ANB | SMS | 1
         -> ANB | EMAIL | 1
         -> Add tag "rsa-nudge-sent"
       None: end
```

The 15-minute wait matters: the calendar sits directly below the application form, so many people book within a couple of minutes. Without the wait they would get "have you booked yet?" while mid-booking.

### ANB | SMS | 1 (274 chars, 2 segments)

```
Hey {{contact.first_name}}, it's Mike. Got your application - have you booked your 15 minute consultation yet?

theremotesalesacademy.com/booking

We'll ring you from +44 7460 091307, save it as Remote Sales Academy so you know it's us.

What's the main reason you reached out?
```

### ANB | EMAIL | 1

**Subject:** `Got your application, {{contact.first_name}}`

```
Hey {{contact.first_name}}, it's Mike.

Got your application. Have you booked your 15 minute consultation yet?

Here's the link: https://theremotesalesacademy.com/booking

Before the meeting, we'll call you from +44 7460 091307. Save it as
Remote Sales Academy so you know it's us.

What's the main reason you reached out? Just hit reply.

Mike
Remote Sales Academy
```

---

## Workflow B — "RSA — Booked Show Rate"

```
Trigger: Customer booked appointment
         Filter: In calendar = RSA Application Call
         Enrol: Contact only
  -> BSR | SMS | Confirm
  -> BSR | EMAIL | Confirm
  -> Wait 30 minutes
  -> BSR | SMS | YouTube
  -> Wait 1 hour before appointment   (if passed: skip outbound)
  -> BSR | SMS | 1hr
```

The trigger must be the **appointment** trigger, not a tag. Appointment merge fields and the "1 hour before" wait only work when an appointment event started the workflow.

The YouTube text goes 30 minutes after booking rather than 24 hours before the call, because bookings here are only ever 1-3 days out. It also means same-day bookers still get the pre-call content instead of having it skipped.

### BSR | SMS | Confirm

```
Nice one {{contact.first_name}}, you're booked in for {{appointment.start_time}}.

We'll call you from +44 7460 091307, save it as Remote Sales Academy so you know it's us.

Anything specific you want us to cover on the call?
```

The question here is deliberately different from Workflow A's. Someone who gets both messages should never be asked the same thing twice.

### BSR | EMAIL | Confirm

**Subject:** `You're booked in — {{appointment.start_time}}`

```
{{contact.first_name}},

You're booked in for {{appointment.start_time}}. It's a quick one, around 15 minutes.

We'll call you from +44 7460 091307. Save it as Remote Sales Academy so you know
it's us when it rings.

Before we speak, watch these. They answer the questions most people ask, so we can
spend the call on you instead:

https://theremotesalesacademy.com/confirmation-page

If you want a proper feel for how we work, Mike's channel is here:
https://youtube.com/@MichealAkerele_Sales

Anything specific you want us to cover? Just hit reply.

Mike
Remote Sales Academy
```

### BSR | SMS | YouTube

```
{{contact.first_name}}, before we speak it's worth watching a couple of these. It'll make the call a lot more useful for you:

youtube.com/@MichealAkerele_Sales

Speak {{appointment.start_time}}.
```

### BSR | SMS | 1hr

```
{{contact.first_name}}, your call is in an hour ({{appointment.start_time}}). We'll ring you from +44 7460 091307.

Find somewhere quiet where you can actually talk it through.
```

---

## SMS formatting rule

All copy uses **GSM-7 safe characters only** — no em dashes, no curly apostrophes, no emoji. A single non-GSM character drops the segment size from 153 characters to 70, doubling the send cost on every message. Watch for this when editing copy directly in GHL, which inserts smart quotes automatically.

---

## Timezone fix (done in code, 2026-08-18)

Appointment times were rendering in the wrong zone for some leads. GHL falls back to the **account** timezone when a contact has none set, and this account is set to `Asia/Dubai`.

Spot check before the fix: Bilal had `Europe/London`, Tenia had `America/New_York`, Jane had nothing — so Jane would have seen her call time in Dubai time.

Cause: our own sync created the GHL contact at application time and never sent a timezone. Whether GHL later filled it in at booking was inconsistent.

Fixed by capturing the browser timezone on the funnel and writing it to the contact:

- `design-options/shared.js` — sends `timeZone` on both the opt-in and application payloads
- `convex/http.ts` — passes it through on `/opt-ins`, `/applications`, `/calendar-booked`
- `convex/ghl.ts` — `upsertContact` now sends `timezone` to GHL

Deliberately not stored in the Convex tables, to avoid a schema change for a field only GHL needs. Applies to new leads from the deploy onwards; existing blank contacts are unaffected.

---

## Still to do

- **Cancellation workflow.** Someone who cancels still gets "your call is in an hour". Fix is a third workflow: trigger Appointment status = cancelled (filtered to RSA Application Call) -> action Remove from workflow -> `RSA — Booked Show Rate`.
- **Quiet hours.** No sending window set on either workflow. A 3am application currently gets a 3am text. If added, set it off the *contact* timezone, not the account's.
- **Verify a live send.** Open a contact in Conversations and check the sent text: does the first name fill in, and does the time match what the lead actually booked.

---

## Reference

| Thing | Value |
|---|---|
| Location | `ZrvuqZuyEg3n9G8JoGF0` ("Remote Sales", timezone Asia/Dubai) |
| Calendar | `qOGJN8o9daw4OP02G60v` — RSA Application Call, 15 min, autoConfirm on, no native notifications |
| Booking page | https://theremotesalesacademy.com/booking |
| YouTube | https://youtube.com/@MichealAkerele_Sales |

**Tags:** `rsa-opt-in`, `rsa-application`, `rsa-booked`, `rsa-qualified`, `rsa-outcome-deal-closed`, `rsa-outcome-deal-lost` are written by the funnel sync. `rsa-nudge-sent` is created and used only by Workflow A.

**Note:** the calendar's redirect URL still points at `remote-sales-academy.vercel.app/confirmation-page` rather than the live domain. Only affects people booking via the raw calendar link, but worth fixing in Calendars -> RSA Application Call -> Forms & Payment.
