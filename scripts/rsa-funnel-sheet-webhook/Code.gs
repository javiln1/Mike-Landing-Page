const FUNNEL_SPREADSHEET_ID = '1qIMuYPxJjBxOzsCzCKA6mkw4J2ZLa-EorOVp4GPg6lE';
const TOKEN_SHA256 = '__SHEETS_WEBHOOK_TOKEN_SHA256__';

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function hash(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map(function(byte) { return ('0' + ((byte + 256) % 256).toString(16)).slice(-2); })
    .join('');
}

function appendRow(sheetName, row) {
  const sheet = SpreadsheetApp.openById(FUNNEL_SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);
  sheet.appendRow(row);
}

function attribution(data, key) {
  return data.attribution && data.attribution[key] ? data.attribution[key] : '';
}

function authorize() {
  return SpreadsheetApp.openById(FUNNEL_SPREADSHEET_ID).getName();
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.token || hash(data.token) !== TOKEN_SHA256) return jsonResponse({ ok: false, error: 'Unauthorized.' });

    if (data.eventType === 'optIn') {
      appendRow('Opt-ins', [
        new Date(data.submittedAt), data.name || '', data.email || '', '',
        attribution(data, 'source'), attribution(data, 'medium'), attribution(data, 'campaign'),
        attribution(data, 'content'), data.landingPage || '',
      ]);
    } else if (data.eventType === 'application') {
      appendRow('Applications', [
        new Date(data.submittedAt), data.qualificationStatus || '', data.name || '', data.email || '',
        data.phone || '', data.instagram || '', data.currentWork || '', data.currentIncome || '',
        data.incomeGoal || '', data.experience || '', data.startTiming || '', data.investmentReadiness || '',
        attribution(data, 'source'), attribution(data, 'medium'), attribution(data, 'campaign'),
        attribution(data, 'content'),
      ]);
    } else if (data.eventType === 'booking') {
      appendRow('Bookings', [
        new Date(data.submittedAt), data.callStart || '', data.timeZone || '', data.name || '', data.email || '',
        data.phone || '', data.closerName || '', data.meetingLink || '', attribution(data, 'source'),
        attribution(data, 'medium'), attribution(data, 'campaign'), attribution(data, 'content'), '',
      ]);
    } else {
      return jsonResponse({ ok: false, error: 'Unknown event type.' });
    }

    return jsonResponse({ ok: true, eventType: data.eventType });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}
