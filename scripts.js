/* ═══════════════════════════════════════════════════════════════
   ZOOM GROWTH - Interactive Scripts
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initCountingAnimations();
  initCalculator();
  initQuiz();
  initFAQ();
  initScrollAnimations();
  initTimer();
});

// ─────────────────────────────────────────────────────────────────
// STICKY CTA
// ─────────────────────────────────────────────────────────────────

function initStickyNav() {
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.getElementById('hero');
  
  if (!stickyCta || !hero) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    });
  }, { threshold: 0 });
  
  observer.observe(hero);
}

// ─────────────────────────────────────────────────────────────────
// COUNTING ANIMATIONS
// ─────────────────────────────────────────────────────────────────

function initCountingAnimations() {
  const counters = document.querySelectorAll('.counting');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, target);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ─────────────────────────────────────────────────────────────────
// LOSS CALCULATOR
// ─────────────────────────────────────────────────────────────────

function initCalculator() {
  const revenueSlider = document.getElementById('revenueSlider');
  const teamSlider = document.getElementById('teamSlider');
  const hoursSlider = document.getElementById('hoursSlider');
  
  if (!revenueSlider || !teamSlider || !hoursSlider) return;
  
  const revenueValue = document.getElementById('revenueValue');
  const teamValue = document.getElementById('teamValue');
  const hoursValue = document.getElementById('hoursValue');
  const lossValue = document.getElementById('lossValue');
  const lossBreakdown = document.getElementById('lossBreakdown');
  
  function updateCalculation() {
    const revenue = parseInt(revenueSlider.value);
    const team = parseInt(teamSlider.value);
    const hours = parseInt(hoursSlider.value);
    
    // Update display values
    revenueValue.textContent = `€${revenue.toLocaleString()}`;
    teamValue.textContent = `${team} ${team === 1 ? 'person' : 'people'}`;
    hoursValue.textContent = `${hours} hours`;
    
    // Calculate losses
    // Labor cost: assume 30% of manual work could be automated, €40/hour avg cost
    const laborLoss = hours * 52 * 40 * 0.3; // yearly
    
    // Revenue loss: 15% of revenue lost due to slow response & missed opportunities
    const revenueLoss = revenue * 12 * 0.15 * (hours / 40);
    
    const totalLoss = Math.round(laborLoss + revenueLoss);
    
    lossValue.textContent = `€${totalLoss.toLocaleString()}`;
    lossBreakdown.textContent = `€${Math.round(laborLoss/1000)}K in labor + €${Math.round(revenueLoss/1000)}K in missed revenue`;
  }
  
  revenueSlider.addEventListener('input', updateCalculation);
  teamSlider.addEventListener('input', updateCalculation);
  hoursSlider.addEventListener('input', updateCalculation);
  
  // Initial calculation
  updateCalculation();
}

// ─────────────────────────────────────────────────────────────────
// AI READINESS QUIZ
// ─────────────────────────────────────────────────────────────────

let quizScore = 0;
let currentQuestion = 1;
const totalQuestions = 5;

function initQuiz() {
  const quizOptions = document.querySelectorAll('.quiz-option');
  
  quizOptions.forEach(option => {
    option.addEventListener('click', () => selectQuizOption(option));
  });
}

function selectQuizOption(option) {
  const question = option.closest('.quiz-question');
  const questionNum = parseInt(question.dataset.question);
  const score = parseInt(option.dataset.score);
  
  // Mark as selected
  question.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
  
  // Add score
  quizScore += score;
  
  // Wait a moment, then proceed
  setTimeout(() => {
    if (questionNum < totalQuestions) {
      goToQuestion(questionNum + 1);
    } else {
      showQuizResults();
    }
  }, 500);
}

function goToQuestion(num) {
  const questions = document.querySelectorAll('.quiz-question');
  const progressFill = document.getElementById('quizProgress');
  const currentQuestionEl = document.getElementById('currentQuestion');
  
  questions.forEach(q => q.classList.remove('active'));
  document.querySelector(`[data-question="${num}"]`).classList.add('active');
  
  currentQuestion = num;
  currentQuestionEl.textContent = num;
  progressFill.style.width = `${(num / totalQuestions) * 100}%`;
}

function showQuizResults() {
  const quizContainer = document.getElementById('quizContainer');
  const quizResults = document.getElementById('quizResults');
  const progressBar = document.querySelector('.quiz-progress');
  
  quizContainer.style.display = 'none';
  progressBar.style.display = 'none';
  quizResults.classList.add('active');
  
  // Calculate percentage (max score = 20, min = 5)
  const percentage = Math.round(((quizScore - 5) / 15) * 100);
  const displayScore = Math.max(35, Math.min(95, percentage + 35));
  
  // Animate score circle
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  const scoreLevel = document.getElementById('scoreLevel');
  const scoreDescription = document.getElementById('scoreDescription');
  const timeSaved = document.getElementById('timeSaved');
  const revenueOpp = document.getElementById('revenueOpp');
  
  // Add gradient definition for score circle
  const svg = scoreCircle.closest('svg');
  if (!svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#a855f7"/>
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
  }
  
  // Animate
  setTimeout(() => {
    const circumference = 283; // 2 * PI * 45
    const offset = circumference - (circumference * displayScore / 100);
    scoreCircle.style.strokeDashoffset = offset;
    
    // Animate number
    let currentScore = 0;
    const increment = displayScore / 30;
    const scoreInterval = setInterval(() => {
      currentScore += increment;
      if (currentScore >= displayScore) {
        currentScore = displayScore;
        clearInterval(scoreInterval);
      }
      scoreValue.textContent = Math.round(currentScore);
    }, 30);
    
  }, 300);
  
  // Set level and description based on score
  if (displayScore >= 75) {
    scoreLevel.textContent = 'ELITE READY';
    scoreDescription.textContent = 'Your business is primed for AI transformation. You have the foundation in place — now it\'s time to scale with automation.';
    timeSaved.textContent = '30+ hours/week';
    revenueOpp.textContent = '€150K+/year';
  } else if (displayScore >= 50) {
    scoreLevel.textContent = 'SCALING OPPORTUNITY';
    scoreDescription.textContent = 'You\'re doing some things right, but there are significant gaps AI can fill. The ROI opportunity here is massive.';
    timeSaved.textContent = '25+ hours/week';
    revenueOpp.textContent = '€100K+/year';
  } else {
    scoreLevel.textContent = 'FOUNDATION STAGE';
    scoreDescription.textContent = 'You\'re leaving money on the table. AI can help you build the systems you need to scale without burnout.';
    timeSaved.textContent = '15+ hours/week';
    revenueOpp.textContent = '€50K+/year';
  }
}

// ─────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Close others
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      // Toggle current
      item.classList.toggle('active');
    });
  });
}

// ─────────────────────────────────────────────────────────────────
// SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────────

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.glass-card, .pain-card, .pricing-card, .case-study, .process-step, .promise-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ─────────────────────────────────────────────────────────────────
// COUNTDOWN TIMER
// ─────────────────────────────────────────────────────────────────

function initTimer() {
  const timerDays = document.getElementById('timerDays');
  const timerHours = document.getElementById('timerHours');
  const timerMins = document.getElementById('timerMins');
  
  if (!timerDays || !timerHours || !timerMins) return;
  
  // Set deadline to end of month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  function updateTimer() {
    const now = new Date();
    const diff = endOfMonth - now;
    
    if (diff <= 0) {
      timerDays.textContent = '00';
      timerHours.textContent = '00';
      timerMins.textContent = '00';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    timerDays.textContent = String(days).padStart(2, '0');
    timerHours.textContent = String(hours).padStart(2, '0');
    timerMins.textContent = String(mins).padStart(2, '0');
  }
  
  updateTimer();
  setInterval(updateTimer, 60000);
}

// ─────────────────────────────────────────────────────────────────
// FORM SUBMISSION
// ─────────────────────────────────────────────────────────────────

function submitApplication(event) {
  event.preventDefault();
  
  const form = document.getElementById('applicationForm');
  const formSuccess = document.getElementById('formSuccess');
  
  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Here you would send to your backend
  console.log('Application submitted:', data);
  
  // For demo, just show success
  form.style.display = 'none';
  formSuccess.classList.add('active');
  
  // Track event (if analytics is set up)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'form_submit', {
      'event_category': 'Application',
      'event_label': data.business_type
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// SMOOTH SCROLL
// ─────────────────────────────────────────────────────────────────

function scrollToApplication() {
  const application = document.getElementById('application');
  if (application) {
    application.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─────────────────────────────────────────────────────────────────
// AUTOMATION FLOW ANIMATION
// ─────────────────────────────────────────────────────────────────

(function initFlowAnimation() {
  const steps = document.querySelectorAll('.flow-step');
  if (!steps.length) return;
  
  let currentStep = 0;
  
  setInterval(() => {
    steps.forEach(step => step.classList.remove('active'));
    
    currentStep = (currentStep + 1) % steps.length;
    
    // Activate current and all previous
    for (let i = 0; i <= currentStep; i++) {
      steps[i].classList.add('active');
    }
  }, 1500);
})();

// ─────────────────────────────────────────────────────────────────
// PARALLAX EFFECT ON ORBS (subtle)
// ─────────────────────────────────────────────────────────────────

document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.gradient-orb');
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  
  orbs.forEach((orb, index) => {
    const factor = (index + 1) * 0.5;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});
