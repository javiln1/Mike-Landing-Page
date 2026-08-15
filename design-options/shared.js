const arrowIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
`;

const applicationQuestions = [
  {
    id: 'current_work',
    type: 'choice',
    question: 'Are you currently working in a 9-5 sales role?',
    choices: [
      'Yes, full-time sales',
      'Yes, full-time but not sales',
      'Part-time sales',
      'Not currently working',
    ],
  },
  {
    id: 'current_income',
    type: 'choice',
    question: 'What is your current monthly income?',
    choices: [
      '$0 - $2,000/mo',
      '$2,000 - $4,000/mo',
      '$4,000 - $6,000/mo',
      '$6,000 - $10,000/mo',
      '$10,000+/mo',
    ],
  },
  {
    id: 'income_goal',
    type: 'choice',
    question: 'How much money do you want to earn in the next 3-6 months?',
    choices: [
      '$3,000 - $5,000/mo',
      '$5,000 - $10,000/mo',
      '$10,000 - $20,000/mo',
      '$20,000+/mo',
    ],
  },
  {
    id: 'experience',
    type: 'choice',
    question: 'What type of sales are you doing right now?',
    choices: [
      'B2C sales',
      'B2B sales',
      'Appointment setting / SDR',
      'High-ticket closing',
      'Not in a sales role yet',
    ],
  },
  {
    id: 'urgency',
    type: 'choice',
    question: 'How soon are you looking to get started?',
    choices: ['Immediately', 'Within 1-2 weeks', 'Within 30 days', 'Just browsing'],
  },
  {
    id: 'name',
    type: 'text',
    question: 'What should we call you?',
    placeholder: 'Your Full Name',
  },
  {
    id: 'email',
    type: 'email',
    question: 'Where should we send your application updates?',
    placeholder: 'your@email.com',
  },
  {
    id: 'instagram',
    type: 'text',
    question: 'What is your Instagram username?',
    placeholder: 'username',
  },
  {
    id: 'phone',
    type: 'phone',
    question: 'Where should we text you about your application?',
    placeholder: 'Enter phone number',
  },
  {
    id: 'liquid_capital',
    type: 'choice',
    question: 'How much are you willing to financially invest in yourself?',
    choices: ['$0', '$500 - $1,000', '$1,000 - $2,500', '$2,500+'],
  },
];

const applicationConfig = {
  optInEndpoint: document.querySelector('meta[name="rsa-optin-endpoint"]')?.content || '',
  endpoint: document.querySelector('meta[name="rsa-application-endpoint"]')?.content || '',
  unqualifiedRedirect: document.querySelector('meta[name="rsa-unqualified-redirect"]')?.content || '/not-qualified',
};

const applicationMarkup = `
  <div class="application" data-application aria-hidden="true">
    <div class="application__progress" data-progress></div>
    <div class="application__top">
    <span class="application__count" data-count>01 / 10</span>
      <button class="application__close" type="button" data-close-application aria-label="Close application">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
    <div class="application__body">
      <div data-question-view>
        <h2 class="application__question" data-question></h2>
        <div class="application__choices" data-choices></div>
        <div class="application__actions">
          <span class="application__hint">Your information is kept private and used only to review your application.</span>
          <button class="back-link" type="button" data-previous>Back</button>
        </div>
      </div>
      <div class="application__success" data-success>
        <h2 data-success-title>Application received.</h2>
        <p data-success-copy>Taking you to the next step now.</p>
        <div class="calendar-embed" data-calendar-embed hidden>
          <div class="calendar-embed__header">
            <strong>Book your application call</strong>
            <span>15 minutes</span>
          </div>
          <div class="calendar-embed__mount" data-calendar-embed-mount role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="1" />
              <path d="M7 3v4M17 3v4M3 10h18M7 14h2M11 14h2M15 14h2M7 18h2M11 18h2" />
            </svg>
            <strong>Calendar embed goes here</strong>
            <p>The booking calendar will load inside this area.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', applicationMarkup);

const application = document.querySelector('[data-application]');
const questionView = application.querySelector('[data-question-view]');
const successView = application.querySelector('[data-success]');
const successTitle = application.querySelector('[data-success-title]');
const successCopy = application.querySelector('[data-success-copy]');
const calendarEmbed = application.querySelector('[data-calendar-embed]');
const applicationBody = application.querySelector('.application__body');
const questionLabel = application.querySelector('[data-question]');
const choices = application.querySelector('[data-choices]');
const count = application.querySelector('[data-count]');
const progress = application.querySelector('[data-progress]');
const previousButton = application.querySelector('[data-previous]');
let currentStep = 0;
const applicationAnswers = {};
let optInCaptured = false;

function renderQuestion() {
  const current = applicationQuestions[currentStep];
  questionLabel.textContent = current.question;
  count.textContent = `${String(currentStep + 1).padStart(2, '0')} / ${String(applicationQuestions.length).padStart(2, '0')}`;
  progress.style.width = `${((currentStep + 1) / applicationQuestions.length) * 100}%`;
  previousButton.hidden = currentStep === 0;
  choices.replaceChildren();

  if (current.type !== 'choice') {
    const field = document.createElement('input');
    field.className = 'application__field';
    field.type = current.type === 'phone' ? 'tel' : current.type;
    field.placeholder = current.placeholder;
    field.setAttribute('aria-label', current.placeholder);
    field.required = true;
    field.value = applicationAnswers[current.id] || '';
    field.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        advanceInput(field);
      }
    });
    choices.append(field);

    if (current.type === 'phone') {
      const consents = document.createElement('div');
      consents.className = 'application__consents';
      consents.innerHTML = `
        <label class="application__consent">
          <input type="checkbox" data-consent="non-marketing" required />
          <span>By checking this box, I consent to receive non-marketing text messages from <strong>Remote Sales Academy</strong> about <strong>your application</strong>. Message frequency varies, message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>
        </label>
        <label class="application__consent">
          <input type="checkbox" data-consent="marketing" required />
          <span>By checking this box, I consent to receive marketing and promotional messages including special offers, discounts, new product updates among others from <strong>Remote Sales Academy</strong> at the phone number provided. Frequency may vary. Message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>
        </label>
      `;
      choices.append(consents);
    }

    const next = document.createElement('button');
    next.className = 'cta application__next';
    next.type = 'button';
    next.innerHTML = `Next Step ${arrowIcon}`;
    next.addEventListener('click', () => advanceInput(field));
    choices.append(next);
    requestAnimationFrame(() => field.focus());
    return;
  }

  current.choices.forEach((label, index) => {
    const choice = document.createElement('button');
    choice.className = 'application__choice';
    choice.type = 'button';
    choice.textContent = label;
    choice.dataset.choiceIndex = String(index);
    if (applicationAnswers[current.id] === label) choice.classList.add('is-selected');
    choice.addEventListener('click', () => selectChoice(choice, label));
    choices.append(choice);
  });

  if (currentStep === applicationQuestions.length - 1 && applicationAnswers[current.id]) {
    renderSubmitButton();
  }
}

function selectChoice(button, label) {
  const current = applicationQuestions[currentStep];
  applicationAnswers[current.id] = label;

  if (currentStep === applicationQuestions.length - 1) {
    choices.querySelectorAll('.application__choice').forEach((choice) => choice.classList.remove('is-selected'));
    button.classList.add('is-selected');
    renderSubmitButton();
    return;
  }

  currentStep += 1;
  renderQuestion();
}

function renderSubmitButton() {
  if (choices.querySelector('[data-final-submit]')) return;
  const submit = document.createElement('button');
  submit.className = 'cta application__next';
  submit.type = 'button';
  submit.dataset.finalSubmit = '';
  submit.innerHTML = `Submit Application ${arrowIcon}`;
  submit.addEventListener('click', finishApplication);
  choices.append(submit);
}

function advanceInput(field) {
  const current = applicationQuestions[currentStep];
  if (!field.value.trim() || !field.checkValidity()) {
    field.focus();
    return;
  }

  if (current.type === 'phone') {
    const unchecked = choices.querySelector('.application__consent input:not(:checked)');
    if (unchecked) {
      unchecked.focus();
      return;
    }
    applicationAnswers.nonMarketingConsent = true;
    applicationAnswers.marketingConsent = true;
  }

  applicationAnswers[current.id] = field.value.trim();
  if (current.id === 'email') captureOptIn();
  currentStep += 1;
  renderQuestion();
}

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
  const hasRequiredCapital = applicationAnswers.liquid_capital === '$2,500+';
  const hasUrgency = applicationAnswers.urgency !== 'Just browsing';
  return hasRequiredCapital && hasUrgency ? 'qualified' : 'unqualified';
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
  let error = choices.querySelector('[data-submission-error]');
  if (!error) {
    error = document.createElement('p');
    error.className = 'application__error';
    error.dataset.submissionError = '';
    choices.append(error);
  }
  error.textContent = message;
  error.focus();
}

async function finishApplication() {
  const submit = choices.querySelector('[data-final-submit]');
  if (!submit || submit.disabled) return;

  if (!applicationConfig.endpoint) {
    showSubmissionError('The application service is not configured yet. Please try again shortly.');
    return;
  }

  const qualificationStatus = getQualificationStatus();
  const payload = {
    currentWork: applicationAnswers.current_work,
    currentIncome: applicationAnswers.current_income,
    incomeGoal: applicationAnswers.income_goal,
    experience: applicationAnswers.experience,
    urgency: applicationAnswers.urgency,
    name: applicationAnswers.name,
    email: applicationAnswers.email,
    instagram: applicationAnswers.instagram,
    phone: applicationAnswers.phone,
    liquidCapital: applicationAnswers.liquid_capital,
    nonMarketingConsent: applicationAnswers.nonMarketingConsent === true,
    marketingConsent: applicationAnswers.marketingConsent === true,
    qualificationStatus,
    submittedAt: Date.now(),
    landingPage: window.location.href,
    userAgent: navigator.userAgent,
    attribution: getAttribution(),
  };

  submit.disabled = true;
  submit.textContent = 'Submitting application…';

  try {
    const response = await fetch(applicationConfig.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Application submission failed.');

    if (window.fbq) window.fbq('track', 'Lead');
    questionView.hidden = true;
    successView.classList.add('is-visible');
    progress.style.width = '100%';

    if (qualificationStatus === 'qualified') {
      successTitle.textContent = 'Choose a time for your application call.';
      successCopy.textContent = 'Select the time that works best for you below.';
      calendarEmbed.hidden = false;
      applicationBody.classList.add('is-calendar');
      count.textContent = 'BOOK YOUR CALL';
      return;
    }

    successTitle.textContent = 'Application received.';
    successCopy.textContent = 'Taking you to the next step now.';
    calendarEmbed.hidden = true;
    applicationBody.classList.remove('is-calendar');
    count.textContent = 'APPLICATION RECEIVED';
    window.setTimeout(() => window.location.assign(applicationConfig.unqualifiedRedirect), 650);
  } catch (error) {
    submit.disabled = false;
    submit.innerHTML = `Submit Application ${arrowIcon}`;
    showSubmissionError(error instanceof Error ? error.message : 'Unable to submit. Please try again.');
  }
}

function openApplication() {
  currentStep = 0;
  optInCaptured = false;
  Object.keys(applicationAnswers).forEach((key) => delete applicationAnswers[key]);
  questionView.hidden = false;
  successView.classList.remove('is-visible');
  successTitle.textContent = 'Application received.';
  successCopy.textContent = 'Taking you to the next step now.';
  calendarEmbed.hidden = true;
  applicationBody.classList.remove('is-calendar');
  application.classList.add('is-open');
  application.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  renderQuestion();
}

function closeApplication() {
  application.classList.remove('is-open');
  application.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-application]').forEach((button) => {
  button.addEventListener('click', openApplication);
});

application.querySelector('[data-close-application]').addEventListener('click', closeApplication);
previousButton.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderQuestion();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && application.classList.contains('is-open')) {
    closeApplication();
  }

  if (!application.classList.contains('is-open')) return;
  const current = applicationQuestions[currentStep];
  if (current.type === 'choice' && /^[1-9]$/.test(event.key)) {
    const index = Number(event.key) - 1;
    const availableChoices = choices.querySelectorAll('.application__choice');
    if (availableChoices[index]) availableChoices[index].click();
  }
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
