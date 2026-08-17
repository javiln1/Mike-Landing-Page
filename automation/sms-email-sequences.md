# RSA — SMS & Email Sequences

Copy of record for the GHL automations. Built from Mike's spec (2026-08-17).

**Number the team calls from:** +44 7460 091307 (as promised on the confirmation page)
**Number SMS sends from:** to be confirmed — may differ

All copy below is written to be **correct either way**: it names the calling number explicitly rather than saying "this number". See [The two-number problem](#the-two-number-problem).

---

## The two-number problem

If SMS sends from a different GHL number than the one the team calls from, the lead gets a text from one unknown number telling them to save a *different* unknown number. That is a real trust cost at exactly the moment you are asking them to trust you enough to take a call.

**Preferred fix:** provision +44 7460 091307 as the sending number in GHL so text and call are one identity. Then every message can say "save this number", the thread is already open on their phone, and saving it is one tap. That version is in [Appendix: same-number copy](#appendix-same-number-copy).

**If they must stay separate**, the copy below is what ships. Two consequences to accept:

- Replies to these texts land on the *SMS* number in GHL conversations, not the calling number. Message 1 ends in a question, so someone needs to be watching that inbox.
- The lead is asked to save a number they have not been contacted from yet. The line "so you know it's us" is doing the work there — do not cut it.

---

## Before launch

**1. `theremotesalesacademy.com/booking` — built, ships on next push.** `design-options/booking.html`, registered in `build-production.ts`. It mounts the GHL calendar directly with no application gate, so a lead returning from an SMS books in one step instead of re-completing the qualification form. Do not point this link at `/` — the application draft lives in `sessionStorage` (`design-options/shared.js:269`), which is gone by the time they tap a link the next day.

Optional prefill: append merge fields to skip re-typing their details.
`theremotesalesacademy.com/booking?first_name={{contact.first_name}}&email={{contact.email}}&phone={{contact.phone}}`
Only worth doing in email — in SMS the URL gets long enough to push the message over a segment boundary.

**2. Confirm the sending number** and pick the copy variant accordingly.

---

## SMS formatting rules

Every message is written in **GSM-7 safe characters only**. No em dashes (`—`), no curly apostrophes (`'`), no emoji.

This matters commercially: a single non-GSM character switches the whole message to UCS-2, dropping segment size from 153 characters to **70**. One stray em dash turns a 2-segment text into a 4-segment text — double the send cost, on every message, forever. Watch for this if Mike edits copy directly in GHL, where the editor inserts smart quotes automatically.

---

## 1. Application received, not yet booked

**Trigger:** tag `rsa-application` added
**Wait:** 15 minutes
**Condition:** only send if tag `rsa-booked` is absent
**Channel:** SMS + Email

> Why the 15-minute wait: the calendar sits on the same page directly below the application form, so a large share of applicants book within a couple of minutes. Firing "have you booked yet?" instantly would reach people mid-booking. The wait lets genuine drop-offs separate themselves out.

### SMS (~260 chars, 2 segments)

```
Hey {{contact.first_name}}, it's Mike. Got your application - have you booked your 15 minute consultation yet?

theremotesalesacademy.com/booking

We'll ring you from +44 7460 091307, save it as Remote Sales Academy so you know it's us.

What's the main reason you reached out?
```

### Email

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

## 2. Booked confirmation

**Trigger:** appointment booked on calendar `qOGJN8o9daw4OP02G60v`
**Timing:** immediately
**Channel:** SMS

Two variants. Which one sends depends on whether they already received message 1 — the closing question should only ever be asked once, otherwise it reads like a bot.

### 2a — Booked without receiving message 1 (~230 chars, 2 segments)

```
Nice one {{contact.first_name}}, you're booked in for {{appointment.start_time}}.

We'll call you from +44 7460 091307, save it as Remote Sales Academy so you know it's us.

Quick one before we speak: what's the main reason you reached out?
```

### 2b — Already received message 1 (~165 chars, 2 segments)

```
Nice one {{contact.first_name}}, you're booked in for {{appointment.start_time}}.

We'll call from +44 7460 091307. Save it as Remote Sales Academy so you know it's us.
```

---

## 3. YouTube prep

**Trigger:** same workflow, timed off appointment start
**Timing:** 24 hours before the call. If the call is booked less than 24 hours out, send 1 hour after booking instead.
**Channel:** SMS

### SMS (~200 chars, 2 segments)

```
{{contact.first_name}}, before we speak it's worth watching a couple of these. It'll make the call a lot more useful for you:

youtube.com/@MichealAkerele_Sales

Speak {{appointment.start_time}}.
```

---

## 4. One hour before the call

**Trigger:** same workflow, 1 hour before appointment start
**Channel:** SMS

### SMS (~190 chars, 2 segments)

```
{{contact.first_name}}, your call is in an hour ({{appointment.start_time}}). We'll ring you from +44 7460 091307.

Find somewhere quiet where you can actually talk it through.
```

---

## Sequence logic

| Lead behaviour | Receives |
|---|---|
| Applies, books within 15 min | 2a, 3, 4 |
| Applies, books later | 1, 2b, 3, 4 |
| Applies, never books | 1 only |
| Books, then cancels | sequence stops on cancel |
| Books, then reschedules | 3 and 4 recalculate to the new time |

**Timing waits must be relative to appointment start, not booking time** — otherwise a reschedule leaves messages 3 and 4 firing against the old slot.

**Quiet hours:** suppress SMS 21:00-08:00 in the contact's local timezone. The application form accepts international numbers, so leads are not all UK.

**Duplicate check:** turn off the native confirmation and reminder notifications on calendar `qOGJN8o9daw4OP02G60v` before enabling this workflow, or every lead gets messaged twice.

---

## Appendix: same-number copy

Use these only once +44 7460 091307 is confirmed as the SMS sending number. Shorter, and the save instruction becomes one tap.

**1 — Application received**
```
Hey {{contact.first_name}}, it's Mike. Got your application - have you booked your 15 minute consultation yet?

theremotesalesacademy.com/booking

We'll be calling you from this number, so save it as Remote Sales Academy.

What's the main reason you reached out?
```

**2a — Booked, no message 1**
```
Nice one {{contact.first_name}}, you're booked in for {{appointment.start_time}}.

Save this number as Remote Sales Academy - it's the one we'll call you on.

Quick one before we speak: what's the main reason you reached out?
```

**2b — Booked, already had message 1** (~150 chars, 1 segment)
```
Nice one {{contact.first_name}}, you're booked in for {{appointment.start_time}}.

Save this number as Remote Sales Academy - it's the one we'll call you on.
```

**4 — One hour before**
```
{{contact.first_name}}, your call is in an hour ({{appointment.start_time}}). We'll ring you on this number.

Find somewhere quiet where you can actually talk it through.
```

---

## Optional additions (not in Mike's spec)

- **T-10 min SMS** — "Calling you in about 10 minutes." Small build, reliably lifts show rate on phone-delivered calls.
- **Reply Y to confirm** on message 4, tagging `rsa-confirmed`, giving the team a live list of unconfirmed leads to chase before the call.
