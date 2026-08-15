const arrowIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
`;

const phoneCountries = [
  { iso: 'AE', name: 'United Arab Emirates', code: '+971' },
  { iso: 'AU', name: 'Australia', code: '+61' },
  { iso: 'CA', name: 'Canada', code: '+1' },
  { iso: 'DE', name: 'Germany', code: '+49' },
  { iso: 'ES', name: 'Spain', code: '+34' },
  { iso: 'FR', name: 'France', code: '+33' },
  { iso: 'GB', name: 'United Kingdom', code: '+44' },
  { iso: 'IE', name: 'Ireland', code: '+353' },
  { iso: 'IN', name: 'India', code: '+91' },
  { iso: 'NL', name: 'Netherlands', code: '+31' },
  { iso: 'NG', name: 'Nigeria', code: '+234' },
  { iso: 'NZ', name: 'New Zealand', code: '+64' },
  { iso: 'PH', name: 'Philippines', code: '+63' },
  { iso: 'PK', name: 'Pakistan', code: '+92' },
  { iso: 'SG', name: 'Singapore', code: '+65' },
  { iso: 'US', name: 'United States', code: '+1' },
  { iso: 'ZA', name: 'South Africa', code: '+27' },
];

const applicationScreens = [
  {
    title: 'Your current position',
    intro: 'Tell us where you are starting from so we can understand which path is most relevant to you.',
    fields: [
      {
        id: 'current_work',
        type: 'choice',
        label: 'What best describes your current situation?',
        choices: [
          'I currently work in sales',
          'I work full-time, but not in sales',
          'I work part-time',
          'I am currently between roles',
          'I am a student',
        ],
      },
    ],
  },
  {
    title: 'Your sales experience',
    intro: 'This helps us understand which parts of your current experience can transfer into remote closing.',
    showWhen: (answers) => answers.current_work === 'I currently work in sales',
    fields: [
      {
        id: 'sales_role',
        type: 'choice',
        label: 'What type of sales role are you currently in?',
        choices: [
          'Appointment setting / SDR',
          'B2B sales',
          'B2C sales',
          'High-ticket closing',
          'Account management',
          'Other',
        ],
      },
    ],
  },
  {
    title: 'Your current income',
    intro: 'This gives us a clear picture of where you are starting.',
    fields: [
      {
        id: 'current_income',
        type: 'choice',
        label: 'Approximately how much do you currently earn per month?',
        helper: 'Include your salary, commission and other regular income.',
        choices: [
          'Less than $2,000 per month',
          '$2,000–$4,000 per month',
          '$4,000–$6,000 per month',
          '$6,000–$10,000 per month',
          'More than $10,000 per month',
        ],
      },
    ],
  },
  {
    title: 'Your income goal',
    intro: 'Now tell us what you want your next level of income to look like.',
    fields: [
      {
        id: 'income_goal',
        type: 'choice',
        label: 'What monthly income would you like to reach within the next 3–6 months?',
        choices: [
          '$3,000–$5,000 per month',
          '$5,000–$10,000 per month',
          '$10,000–$20,000 per month',
          'More than $20,000 per month',
        ],
      },
    ],
  },
  {
    title: 'Your timing',
    intro: 'Be honest about when you would be ready to make a change.',
    fields: [
      {
        id: 'start_timing',
        type: 'choice',
        label: 'When would you be ready to begin, if accepted?',
        choices: [
          'Immediately',
          'Within the next two weeks',
          'Within 30 days',
          'Within 1–3 months',
          'I am only researching at the moment',
        ],
      },
    ],
  },
  {
    title: 'Your investment readiness',
    intro: 'This helps us determine whether the programme is commercially realistic for you right now.',
    fields: [
      {
        id: 'investment_readiness',
        type: 'choice',
        label: 'If accepted, could you invest $2,500 in the programme?',
        choices: [
          'Yes',
          'Yes, with a payment plan',
          'Not immediately, but within 30 days',
          'No',
        ],
      },
    ],
  },
  {
    title: 'Your details',
    intro: 'We will use these details to review your application and contact you about the next step.',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'What should we call you?',
        placeholder: 'Full name',
        autocomplete: 'name',
      },
      {
        id: 'email',
        type: 'email',
        label: 'What is the best email address for you?',
        placeholder: 'you@example.com',
        autocomplete: 'email',
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'Where should we text you about your application?',
        helper: 'Use an international mobile number, including + and your country code.',
        placeholder: '+44 7700 900000',
        autocomplete: 'tel',
      },
      {
        id: 'instagram',
        type: 'text',
        label: 'What is your Instagram username? (Optional)',
        placeholder: '@username',
        autocomplete: 'off',
        required: false,
      },
    ],
  },
];

const applicationConfig = {
  optInEndpoint: document.querySelector('meta[name="rsa-optin-endpoint"]')?.content || '',
  endpoint: document.querySelector('meta[name="rsa-application-endpoint"]')?.content || '',
  calendarBookedEndpoint: document.querySelector('meta[name="rsa-calendar-booked-endpoint"]')?.content || '',
  unqualifiedRedirect: document.querySelector('meta[name="rsa-unqualified-redirect"]')?.content || '/not-qualified',
  confirmationRedirect: document.querySelector('meta[name="rsa-confirmation-redirect"]')?.content || '/confirmation-page',
  calendarUrl: document.querySelector('meta[name="rsa-calendar-url"]')?.content || '',
};

const isLocalPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);

const applicationMarkup = `
  <div class="application" data-application aria-hidden="true">
    <div class="application__progress" data-progress></div>
    <div class="application__top">
      <button class="application__close" type="button" data-close-application aria-label="Close application">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <div class="application__body">
      <div data-screen-view>
        <h2 class="application__question" data-screen-title></h2>
        <p class="application__intro" data-screen-intro></p>
        <form class="application__form" data-application-form novalidate>
          <div class="application__fields" data-fields></div>
          <button class="cta application__next" type="submit" data-next-screen>Continue ${arrowIcon}</button>
        </form>
        <div class="application__actions">
          <button class="back-link" type="button" data-previous>Back</button>
        </div>
      </div>
      <div class="application__success" data-success>
        <h2 data-success-title>Application received.</h2>
        <p data-success-copy>Taking you to the next step now.</p>
        <div class="calendar-embed" data-calendar-embed hidden>
          <div class="calendar-embed__mount" data-calendar-embed-mount aria-label="Application Call calendar"></div>
        </div>
      </div>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', applicationMarkup);

const application = document.querySelector('[data-application]');
const applicationBody = application.querySelector('.application__body');
const screenView = application.querySelector('[data-screen-view]');
const successView = application.querySelector('[data-success]');
const successTitle = application.querySelector('[data-success-title]');
const successCopy = application.querySelector('[data-success-copy]');
const calendarEmbed = application.querySelector('[data-calendar-embed]');
const calendarMount = application.querySelector('[data-calendar-embed-mount]');
const screenTitle = application.querySelector('[data-screen-title]');
const screenIntro = application.querySelector('[data-screen-intro]');
const form = application.querySelector('[data-application-form]');
const fields = application.querySelector('[data-fields]');
const nextButton = application.querySelector('[data-next-screen]');
const progress = application.querySelector('[data-progress]');
const previousButton = application.querySelector('[data-previous]');
let currentScreen = 0;
let optInCaptured = false;
let calendarLoaded = false;
let calendarBookingSynced = false;
let calendarRedirectStarted = false;
let isTransitioning = false;
let transitionTimer;
const applicationAnswers = {};
const applicationDraftKey = 'rsa-application-draft-v1';
const draftAnswerKeys = new Set([
  ...applicationScreens.flatMap((screen) => screen.fields.map((field) => field.id)),
  'phoneCountry',
  'phoneNational',
]);

function saveApplicationDraft() {
  try {
    const answers = Object.fromEntries(
      Object.entries(applicationAnswers).filter(([key]) => draftAnswerKeys.has(key)),
    );
    sessionStorage.setItem(applicationDraftKey, JSON.stringify({ currentScreen, answers }));
  } catch {
    // The form remains fully usable when browser storage is unavailable.
  }
}

function readApplicationDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(applicationDraftKey) || 'null');
    if (!draft || typeof draft !== 'object' || !draft.answers || typeof draft.answers !== 'object') return null;
    const answers = Object.fromEntries(
      Object.entries(draft.answers).filter(([key]) => draftAnswerKeys.has(key)),
    );
    return { currentScreen: Number(draft.currentScreen), answers };
  } catch {
    return null;
  }
}

function clearApplicationDraft() {
  try {
    sessionStorage.removeItem(applicationDraftKey);
  } catch {
    // Ignore storage restrictions after a successful submission.
  }
}

function visibleFields(screen) {
  return screen.fields.filter((field) => !field.showWhen || field.showWhen(applicationAnswers));
}

function visibleScreens() {
  return applicationScreens.filter((screen) => !screen.showWhen || screen.showWhen(applicationAnswers));
}

function adjacentScreenIndex(direction) {
  let index = currentScreen + direction;
  while (index >= 0 && index < applicationScreens.length) {
    const screen = applicationScreens[index];
    if (!screen.showWhen || screen.showWhen(applicationAnswers)) return index;
    index += direction;
  }
  return index;
}

function updateProgress() {
  const screen = applicationScreens[currentScreen];
  const screens = visibleScreens();
  const visibleIndex = screens.indexOf(screen);
  progress.style.width = `${((visibleIndex + 1) / screens.length) * 100}%`;
}

function transitionToScreen(nextScreen, direction) {
  if (isTransitioning) return;
  isTransitioning = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  screenView.style.setProperty('--flow-exit-x', direction > 0 ? '-10px' : '10px');
  screenView.style.setProperty('--flow-enter-x', direction > 0 ? '10px' : '-10px');
  screenView.classList.add('is-leaving');

  transitionTimer = window.setTimeout(() => {
    currentScreen = nextScreen;
    saveApplicationDraft();
    renderScreen();
    applicationBody.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    screenView.classList.remove('is-leaving');
    screenView.classList.add('is-entering');
    screenView.getBoundingClientRect();
    screenView.classList.remove('is-entering');
    transitionTimer = window.setTimeout(() => {
      isTransitioning = false;
    }, reducedMotion ? 0 : 150);
  }, reducedMotion ? 0 : 100);
}

function fieldError(fieldId, message) {
  const group = fields.querySelector(`[data-field-group="${fieldId}"]`);
  if (!group) return;
  let error = group.querySelector('.application__field-error');
  if (!error) {
    error = document.createElement('p');
    error.className = 'application__field-error';
    group.append(error);
  }
  error.textContent = message;
}

function clearFieldError(fieldId) {
  fields.querySelector(`[data-field-group="${fieldId}"] .application__field-error`)?.remove();
}

function renderChoiceField(field) {
  const options = document.createElement('div');
  options.className = 'application__choices';

  field.choices.forEach((label) => {
    const choice = document.createElement('button');
    choice.className = 'application__choice';
    choice.type = 'button';
    choice.textContent = label;
    choice.setAttribute('aria-pressed', applicationAnswers[field.id] === label ? 'true' : 'false');
    if (applicationAnswers[field.id] === label) choice.classList.add('is-selected');
    choice.addEventListener('click', () => {
      if (isTransitioning) return;
      applicationAnswers[field.id] = label;
      clearFieldError(field.id);
      if (field.id === 'current_work' && label !== 'I currently work in sales') {
        delete applicationAnswers.sales_role;
      }
      options.querySelectorAll('.application__choice').forEach((option) => {
        const selected = option === choice;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      updateProgress();
      saveApplicationDraft();
      const nextScreen = adjacentScreenIndex(1);
      if (visibleFields(applicationScreens[currentScreen]).length === 1 && nextScreen < applicationScreens.length) {
        transitionToScreen(nextScreen, 1);
      }
    });
    options.append(choice);
  });

  return options;
}

function renderTextField(field) {
  const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
  input.className = `application__field${field.type === 'textarea' ? ' application__field--textarea' : ''}`;
  if (field.type !== 'textarea') input.type = field.type;
  input.name = field.id;
  input.placeholder = field.placeholder || '';
  input.autocomplete = field.autocomplete || 'off';
  input.required = field.required !== false;
  input.value = applicationAnswers[field.id] || '';
  if (field.minLength) input.minLength = field.minLength;
  if (field.type === 'tel') input.inputMode = 'tel';
  input.addEventListener('input', () => {
    applicationAnswers[field.id] = input.value;
    saveApplicationDraft();
    clearFieldError(field.id);
    const counter = input.parentElement.querySelector('[data-character-count]');
    if (counter) counter.textContent = `${input.value.trim().length} / ${field.minLength}`;
  });
  return input;
}

function formatNationalPhone(value, maxDigits = 14) {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return digits.match(/.{1,3}/g).join(' ');
}

function renderPhoneField(field, labelledBy) {
  const region = navigator.language.split('-')[1]?.toUpperCase();
  const defaultCountry = phoneCountries.find((country) => country.iso === region) || phoneCountries.find((country) => country.iso === 'GB');
  const wrapper = document.createElement('div');
  wrapper.className = 'application__phone';

  const countrySelect = document.createElement('select');
  countrySelect.className = 'application__country-native';
  countrySelect.name = 'phone_country';
  countrySelect.hidden = true;
  phoneCountries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.iso;
    option.textContent = `${country.name} (${country.code})`;
    countrySelect.append(option);
  });
  countrySelect.value = applicationAnswers.phoneCountry || defaultCountry.iso;

  const countryPicker = document.createElement('div');
  countryPicker.className = 'application__country-picker';
  const countryTrigger = document.createElement('button');
  countryTrigger.className = 'application__country-trigger';
  countryTrigger.type = 'button';
  countryTrigger.setAttribute('aria-haspopup', 'listbox');
  countryTrigger.setAttribute('aria-expanded', 'false');
  const selectedFlag = document.createElement('img');
  selectedFlag.className = 'application__flag';
  selectedFlag.alt = '';
  const selectedCode = document.createElement('span');
  const pickerChevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pickerChevron.setAttribute('viewBox', '0 0 16 16');
  pickerChevron.setAttribute('aria-hidden', 'true');
  pickerChevron.innerHTML = '<path d="m3 6 5 5 5-5" />';
  countryTrigger.append(selectedFlag, selectedCode, pickerChevron);

  const countryMenu = document.createElement('div');
  countryMenu.className = 'application__country-menu';
  countryMenu.setAttribute('role', 'listbox');
  countryMenu.hidden = true;

  const flagUrl = (iso) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  const renderSelectedCountry = () => {
    const selectedCountry = phoneCountries.find((country) => country.iso === countrySelect.value) || defaultCountry;
    selectedFlag.src = flagUrl(selectedCountry.iso);
    selectedCode.textContent = selectedCountry.code;
    countryTrigger.setAttribute('aria-label', `${selectedCountry.name}, ${selectedCountry.code}. Choose country code.`);
    countryMenu.querySelectorAll('[role="option"]').forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.iso === selectedCountry.iso));
    });
  };

  phoneCountries.forEach((country) => {
    const option = document.createElement('button');
    option.className = 'application__country-option';
    option.type = 'button';
    option.dataset.iso = country.iso;
    option.setAttribute('role', 'option');
    option.innerHTML = `
      <img class="application__flag" src="${flagUrl(country.iso)}" alt="" />
      <span>${country.name}</span>
      <strong>${country.code}</strong>
    `;
    option.addEventListener('click', () => {
      countrySelect.value = country.iso;
      countryMenu.hidden = true;
      countryTrigger.setAttribute('aria-expanded', 'false');
      renderSelectedCountry();
      updatePhone();
      countryTrigger.focus();
    });
    countryMenu.append(option);
  });

  countryTrigger.addEventListener('click', () => {
    const opening = countryMenu.hidden;
    countryMenu.hidden = !opening;
    countryTrigger.setAttribute('aria-expanded', String(opening));
    if (opening) countryMenu.querySelector('[aria-selected="true"]')?.focus();
  });
  countryPicker.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || countryMenu.hidden) return;
    countryMenu.hidden = true;
    countryTrigger.setAttribute('aria-expanded', 'false');
    countryTrigger.focus();
  });
  countryPicker.addEventListener('focusout', (event) => {
    if (event.relatedTarget && countryPicker.contains(event.relatedTarget)) return;
    countryMenu.hidden = true;
    countryTrigger.setAttribute('aria-expanded', 'false');
  });
  countryPicker.append(countryTrigger, countryMenu);

  const input = document.createElement('input');
  input.className = 'application__field';
  input.type = 'tel';
  input.name = field.id;
  input.placeholder = '770 090 0000';
  input.autocomplete = field.autocomplete || 'tel-national';
  input.inputMode = 'tel';
  input.required = true;
  input.setAttribute('aria-labelledby', labelledBy);
  input.value = formatNationalPhone(applicationAnswers.phoneNational || '');

  const updatePhone = () => {
    const rawValue = input.value.trim();
    if (rawValue.startsWith('+')) {
      const internationalDigits = rawValue.replace(/\D/g, '');
      const detectedCountry = [...phoneCountries]
        .sort((a, b) => b.code.length - a.code.length)
        .find((country) => internationalDigits.startsWith(country.code.replace(/\D/g, '')));
      if (detectedCountry) {
        countrySelect.value = detectedCountry.iso;
        input.value = internationalDigits.slice(detectedCountry.code.replace(/\D/g, '').length);
        renderSelectedCountry();
      }
    }
    const selectedCountry = phoneCountries.find((country) => country.iso === countrySelect.value) || defaultCountry;
    const maxNationalDigits = 15 - selectedCountry.code.replace(/\D/g, '').length;
    const formatted = formatNationalPhone(input.value, maxNationalDigits);
    const nationalDigits = formatted.replace(/\D/g, '');
    input.value = formatted;
    applicationAnswers.phoneCountry = selectedCountry.iso;
    applicationAnswers.phoneCountryCode = selectedCountry.code;
    applicationAnswers.phoneNational = nationalDigits;
    applicationAnswers.phone = `${selectedCountry.code}${nationalDigits}`;
    saveApplicationDraft();
    clearFieldError(field.id);
  };

  input.addEventListener('input', updatePhone);
  renderSelectedCountry();
  updatePhone();
  wrapper.append(countryPicker, countrySelect, input);
  return wrapper;
}

function renderScreen() {
  const screen = applicationScreens[currentScreen];
  const screenFields = visibleFields(screen);
  const singleQuestion = screenFields.length === 1;
  const primaryField = screenFields[0];
  const previousScreen = adjacentScreenIndex(-1);
  const nextScreen = adjacentScreenIndex(1);
  screenTitle.id = 'application-screen-title';
  screenTitle.textContent = singleQuestion ? primaryField.label : screen.title;
  if (screen.summary) {
    screenIntro.textContent = `You’re aiming to move from ${applicationAnswers.current_income || 'your current income'} to ${applicationAnswers.income_goal || 'your target income'}. Tell us what has changed and why reaching that goal matters now.`;
  } else {
    screenIntro.textContent = singleQuestion ? (primaryField.helper || screen.intro) : screen.intro;
  }
  updateProgress();
  previousButton.hidden = previousScreen < 0;
  previousButton.parentElement.hidden = previousScreen < 0;
  nextButton.innerHTML = nextScreen >= applicationScreens.length
    ? `Submit My Application ${arrowIcon}`
    : `Continue ${arrowIcon}`;
  nextButton.hidden = screenFields.length === 1 && screenFields[0].type === 'choice';
  fields.replaceChildren();

  screenFields.forEach((field) => {
    const group = document.createElement('section');
    group.className = 'application__group';
    group.dataset.fieldGroup = field.id;

    const label = document.createElement('h3');
    label.className = 'application__label';
    label.textContent = field.label;
    if (!singleQuestion) group.append(label);

    if (field.helper && !singleQuestion) {
      const helper = document.createElement('p');
      helper.className = 'application__helper';
      helper.textContent = field.helper;
      group.append(helper);
    }

    if (field.type === 'choice') {
      const choices = renderChoiceField(field);
      if (singleQuestion) {
        choices.setAttribute('role', 'group');
        choices.setAttribute('aria-labelledby', screenTitle.id);
      }
      group.append(choices);
    } else if (field.type === 'tel') {
      const labelledBy = singleQuestion ? screenTitle.id : `label-${field.id}`;
      if (!singleQuestion) label.id = labelledBy;
      group.append(renderPhoneField(field, labelledBy));
    } else {
      const input = renderTextField(field);
      const labelledBy = singleQuestion ? screenTitle.id : `label-${field.id}`;
      if (!singleQuestion) label.id = labelledBy;
      input.setAttribute('aria-labelledby', labelledBy);
      group.append(input);
      if (field.minLength) {
        const counter = document.createElement('span');
        counter.className = 'application__character-count';
        counter.dataset.characterCount = '';
        counter.textContent = `${(applicationAnswers[field.id] || '').trim().length} / ${field.minLength}`;
        group.append(counter);
      }
    }

    fields.append(group);
  });
}

function validateScreen() {
  const screen = applicationScreens[currentScreen];
  let valid = true;

  visibleFields(screen).forEach((field) => {
    const value = String(applicationAnswers[field.id] || '').trim();
    clearFieldError(field.id);
    if (!value && field.required === false) return;
    if (!value) {
      fieldError(field.id, 'Please complete this field.');
      valid = false;
      return;
    }
    if (field.minLength && value.length < field.minLength) {
      fieldError(field.id, `Please write at least ${field.minLength} characters.`);
      valid = false;
      return;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldError(field.id, 'Enter a valid email address.');
      valid = false;
    }
    if (field.type === 'tel' && (!value.startsWith('+') || value.replace(/\D/g, '').length < 8 || value.replace(/\D/g, '').length > 15)) {
      fieldError(field.id, 'Enter a valid international mobile number, including + and your country code.');
      valid = false;
    }
  });

  fields.querySelector('.application__field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return valid;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isTransitioning) return;
  if (!validateScreen()) return;
  const nextScreen = adjacentScreenIndex(1);
  if (nextScreen < applicationScreens.length) {
    transitionToScreen(nextScreen, 1);
    return;
  }
  finishApplication();
});

previousButton.addEventListener('click', () => {
  if (isTransitioning) return;
  const previousScreen = adjacentScreenIndex(-1);
  if (previousScreen < 0) return;
  transitionToScreen(previousScreen, -1);
});

function captureOptIn() {
  if (optInCaptured || !applicationConfig.optInEndpoint) return;
  const name = applicationAnswers.name?.trim();
  const email = applicationAnswers.email?.trim();
  if (!name || !email) return;
  optInCaptured = true;
  fetch(applicationConfig.optInEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      submittedAt: Date.now(),
      landingPage: window.location.href,
      userAgent: navigator.userAgent,
      attribution: getAttribution(),
    }),
    keepalive: true,
  }).catch(() => {
    optInCaptured = false;
  });
}

function getQualificationStatus() {
  const canInvest = ['Yes', 'Yes, with a payment plan'].includes(applicationAnswers.investment_readiness);
  const readySoon = ['Immediately', 'Within the next two weeks', 'Within 30 days'].includes(applicationAnswers.start_timing);
  return canInvest && readySoon ? 'qualified' : 'unqualified';
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const value = (key) => params.get(key) || undefined;
  return {
    source: value('utm_source'),
    medium: value('utm_medium'),
    campaign: value('utm_campaign'),
    content: value('utm_content'),
  };
}

function showSubmissionError(message) {
  let error = form.querySelector('[data-submission-error]');
  if (!error) {
    error = document.createElement('p');
    error.className = 'application__error';
    error.dataset.submissionError = '';
    form.append(error);
  }
  error.textContent = message;
}

function buildCalendarUrl() {
  const url = new URL(applicationConfig.calendarUrl);
  const nameParts = applicationAnswers.name.trim().split(/\s+/);
  url.searchParams.set('first_name', nameParts.shift() || applicationAnswers.name);
  if (nameParts.length) url.searchParams.set('last_name', nameParts.join(' '));
  url.searchParams.set('email', applicationAnswers.email);
  url.searchParams.set('phone', applicationAnswers.phone);
  const attribution = getAttribution();
  if (attribution.source) url.searchParams.set('utm_source', attribution.source);
  if (attribution.medium) url.searchParams.set('utm_medium', attribution.medium);
  if (attribution.campaign) url.searchParams.set('utm_campaign', attribution.campaign);
  if (attribution.content) url.searchParams.set('utm_content', attribution.content);
  return url.toString();
}

function loadCalendar() {
  if (!applicationConfig.calendarUrl) {
    calendarMount.innerHTML = '<p class="calendar-embed__error">The Application Call calendar is not configured yet.</p>';
    return;
  }

  if (calendarLoaded) return;
  calendarLoaded = true;
  const iframe = document.createElement('iframe');
  iframe.src = buildCalendarUrl();
  iframe.id = 'msgsndr-calendar';
  iframe.title = 'RSA Application Call calendar';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allow', 'payment');
  calendarMount.replaceChildren(iframe);

  if (!document.querySelector('script[data-ghl-calendar-embed]')) {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.async = true;
    script.dataset.ghlCalendarEmbed = '';
    document.head.append(script);
  }
}

async function syncCalendarBooking(calendarId, detail = {}) {
  if (calendarBookingSynced || !applicationConfig.calendarBookedEndpoint || isLocalPreview) return;
  calendarBookingSynced = true;
  const booking = detail.appointment || detail.booking || detail;
  try {
    const response = await fetch(applicationConfig.calendarBookedEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calendarId,
        name: applicationAnswers.name,
        email: applicationAnswers.email,
        phone: applicationAnswers.phone,
        callStart: booking.event_start_time || booking.eventStartTime || booking.startTime || booking.start,
        timeZone: booking.timezone || booking.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        meetingLink: booking.meeting_location || booking.meetingLocation || booking.meetingLink || booking.location,
        attribution: getAttribution(),
      }),
      keepalive: true,
    });
    if (!response.ok) throw new Error('Booking sync failed.');
  } catch {
    calendarBookingSynced = false;
  }
}

function buildConfirmationUrl(detail = {}) {
  const booking = detail.appointment || detail.booking || detail;
  const start = booking.event_start_time || booking.eventStartTime || booking.startTime || booking.start;
  const end = booking.event_end_time || booking.eventEndTime || booking.endTime || booking.end;
  const path = isLocalPreview ? '/confirmation-page.html' : applicationConfig.confirmationRedirect;
  const url = new URL(path, window.location.origin);
  if (start) url.searchParams.set('event_start_time', start);
  if (end) url.searchParams.set('event_end_time', end);
  return url.toString();
}

window.addEventListener('message', (event) => {
  const iframe = calendarMount.querySelector('iframe');
  const [messageType, detail] = Array.isArray(event.data) ? event.data : [];
  if (
    !iframe
    || event.source !== iframe.contentWindow
    || event.origin !== new URL(applicationConfig.calendarUrl).origin
    || messageType !== 'msgsndr-booking-complete'
    || calendarRedirectStarted
  ) return;
  calendarRedirectStarted = true;
  if (window.fbq) window.fbq('track', 'Schedule');
  syncCalendarBooking(detail?.calendarId, detail);
  window.location.assign(buildConfirmationUrl(detail));
});

async function finishApplication() {
  if (nextButton.disabled) return;
  if (!applicationConfig.endpoint) {
    showSubmissionError('The application service is not configured yet. Please try again shortly.');
    return;
  }

  const qualificationStatus = getQualificationStatus();
  const payload = {
    currentWork: applicationAnswers.current_work,
    currentIncome: applicationAnswers.current_income,
    incomeGoal: applicationAnswers.income_goal,
    experience: applicationAnswers.sales_role || 'Not currently in a sales role',
    salesRole: applicationAnswers.sales_role,
    urgency: applicationAnswers.start_timing,
    startTiming: applicationAnswers.start_timing,
    investmentReadiness: applicationAnswers.investment_readiness,
    liquidCapital: applicationAnswers.investment_readiness,
    name: applicationAnswers.name,
    email: applicationAnswers.email,
    instagram: applicationAnswers.instagram?.trim() || undefined,
    phone: applicationAnswers.phone,
    phoneCountryCode: applicationAnswers.phoneCountryCode,
    phoneNational: applicationAnswers.phoneNational,
    qualificationStatus,
    submittedAt: Date.now(),
    landingPage: window.location.href,
    userAgent: navigator.userAgent,
    attribution: getAttribution(),
  };

  nextButton.disabled = true;
  nextButton.textContent = 'Submitting application…';
  if (!isLocalPreview) captureOptIn();

  try {
    if (isLocalPreview) {
      await new Promise((resolve) => window.setTimeout(resolve, 180));
    } else {
      const response = await fetch(applicationConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Application submission failed.');
    }

    if (window.fbq) window.fbq('track', 'Lead');
    clearApplicationDraft();
    screenView.hidden = true;
    successView.classList.add('is-visible');
    progress.style.width = '100%';

    if (qualificationStatus === 'qualified') {
      successTitle.textContent = 'Book your call.';
      successCopy.hidden = true;
      calendarEmbed.hidden = false;
      applicationBody.classList.add('is-calendar');
      loadCalendar();
      return;
    }

    successTitle.textContent = 'Your application has been received.';
    successCopy.hidden = false;
    successCopy.textContent = 'Based on your answers, an Application Call is not the right next step yet. We are taking you to the free training resources now.';
    const unqualifiedRedirect = isLocalPreview ? '/not-qualified.html' : applicationConfig.unqualifiedRedirect;
    window.setTimeout(() => window.location.assign(unqualifiedRedirect), 1100);
  } catch (error) {
    nextButton.disabled = false;
    nextButton.innerHTML = `Submit My Application ${arrowIcon}`;
    showSubmissionError(error instanceof Error ? error.message : 'Unable to submit. Please try again.');
  }
}

function openApplication() {
  window.clearTimeout(transitionTimer);
  isTransitioning = false;
  screenView.classList.remove('is-leaving', 'is-entering');
  const draft = readApplicationDraft();
  currentScreen = draft?.currentScreen ?? 0;
  optInCaptured = false;
  calendarLoaded = false;
  calendarBookingSynced = false;
  calendarRedirectStarted = false;
  Object.keys(applicationAnswers).forEach((key) => delete applicationAnswers[key]);
  if (draft) Object.assign(applicationAnswers, draft.answers);
  const restoredScreen = applicationScreens[currentScreen];
  if (!restoredScreen || (restoredScreen.showWhen && !restoredScreen.showWhen(applicationAnswers))) currentScreen = 0;
  screenView.hidden = false;
  successView.classList.remove('is-visible');
  successTitle.textContent = 'Application received.';
  successCopy.textContent = 'Taking you to the next step now.';
  successCopy.hidden = false;
  calendarEmbed.hidden = true;
  calendarMount.replaceChildren();
  applicationBody.classList.remove('is-calendar');
  nextButton.disabled = false;
  application.classList.add('is-open');
  application.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  renderScreen();
}

function closeApplication() {
  window.clearTimeout(transitionTimer);
  isTransitioning = false;
  saveApplicationDraft();
  application.classList.remove('is-open');
  application.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-application]').forEach((button) => {
  button.addEventListener('click', openApplication);
});

application.querySelector('[data-close-application]').addEventListener('click', closeApplication);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && application.classList.contains('is-open')) closeApplication();
});

document.querySelectorAll('[data-video-shell]').forEach((shell) => {
  const video = shell.querySelector('video');
  const control = shell.querySelector('[data-video-control]');
  const progressFill = shell.querySelector('[data-video-progress]');
  if (!video || !control) return;

  control.addEventListener('click', async () => {
    video.muted = false;
    try {
      await video.play();
      control.classList.add('is-hidden');
    } catch {
      control.querySelector('.video-control__inner').lastElementChild.textContent = 'PRESS PLAY TO START';
    }
  });

  video.addEventListener('timeupdate', () => {
    if (!progressFill || !video.duration) return;
    progressFill.style.width = `${(video.currentTime / video.duration) * 100}%`;
  });
});
