/* ═══════════════════════════════════════════════════════════════
   ZOOM GROWTH - Tools Page Scripts
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initToolTabs();
  initQuiz();
  initCalculator();
  initScanner();
});

// ─────────────────────────────────────────────────────────────────
// TOOL TABS
// ─────────────────────────────────────────────────────────────────

function initToolTabs() {
  const tabs = document.querySelectorAll('.tool-tab');
  const sections = document.querySelectorAll('.tool-section');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tool = tab.dataset.tool;
      
      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update sections
      sections.forEach(section => {
        if (section.id === `tool-${tool}`) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────
// AI READINESS QUIZ
// ─────────────────────────────────────────────────────────────────

let quizScore = 0;
let quizTags = [];
let currentQuestion = 1;
const totalQuestions = 6;

function initQuiz() {
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(option => {
    option.addEventListener('click', () => selectQuizOption(option));
  });
}

function selectQuizOption(option) {
  const question = option.closest('.quiz-question');
  const questionNum = parseInt(question.dataset.q);
  const score = parseInt(option.dataset.score);
  const tag = option.dataset.tag;
  
  // Mark selected
  question.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
  
  // Add score and tag
  quizScore += score;
  quizTags.push(tag);
  
  // Next question or results
  setTimeout(() => {
    if (questionNum < totalQuestions) {
      goToQuestion(questionNum + 1);
    } else {
      showQuizResults();
    }
  }, 400);
}

function goToQuestion(num) {
  const questions = document.querySelectorAll('.quiz-question');
  const progressFill = document.getElementById('quizProgress');
  const currentQ = document.getElementById('currentQ');
  
  questions.forEach(q => q.classList.remove('active'));
  document.querySelector(`[data-q="${num}"]`).classList.add('active');
  
  currentQuestion = num;
  currentQ.textContent = num;
  progressFill.style.width = `${(num / totalQuestions) * 100}%`;
}

function showQuizResults() {
  const container = document.getElementById('quizContainer');
  const results = document.getElementById('quizResults');
  const progress = document.querySelector('.quiz-progress');
  
  container.style.display = 'none';
  progress.style.display = 'none';
  results.classList.add('active');
  
  // Calculate score (max 24, min 6)
  const percentage = Math.round(((quizScore - 6) / 18) * 100);
  const displayScore = Math.max(30, Math.min(95, percentage + 30));
  
  // Animate score
  const scoreRing = document.getElementById('scoreRing');
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreLabel = document.getElementById('scoreLabel');
  const scoreDesc = document.getElementById('scoreDescription');
  const timeSaved = document.getElementById('timeSaved');
  const moneySaved = document.getElementById('moneySaved');
  const priority = document.getElementById('priority');
  
  setTimeout(() => {
    // Animate ring
    const circumference = 339;
    const offset = circumference - (circumference * displayScore / 100);
    scoreRing.style.strokeDashoffset = offset;
    
    // Animate number
    let current = 0;
    const increment = displayScore / 40;
    const interval = setInterval(() => {
      current += increment;
      if (current >= displayScore) {
        current = displayScore;
        clearInterval(interval);
      }
      scoreNumber.textContent = Math.round(current);
    }, 25);
  }, 200);
  
  // Set results based on score
  if (displayScore >= 75) {
    scoreLabel.textContent = 'ELITE READY';
    scoreDesc.textContent = 'Your business is primed for AI transformation. You have the systems and mindset in place — now it\'s time to scale with advanced automation.';
    timeSaved.textContent = '30+ hours/week';
    moneySaved.textContent = '€150K+/year';
    priority.textContent = 'Advanced Sales AI';
  } else if (displayScore >= 50) {
    scoreLabel.textContent = 'SCALING OPPORTUNITY';
    scoreDesc.textContent = 'You\'re doing many things right, but there are significant automation gaps. The ROI opportunity from AI systems is substantial.';
    timeSaved.textContent = '20+ hours/week';
    moneySaved.textContent = '€80K+/year';
    priority.textContent = 'Lead Automation';
  } else {
    scoreLabel.textContent = 'FOUNDATION STAGE';
    scoreDesc.textContent = 'You\'re leaving money on the table with manual processes. AI can help you build the systems foundation you need to scale efficiently.';
    timeSaved.textContent = '15+ hours/week';
    moneySaved.textContent = '€40K+/year';
    priority.textContent = 'Customer Support AI';
  }
}

function resetQuiz() {
  quizScore = 0;
  quizTags = [];
  currentQuestion = 1;
  
  const container = document.getElementById('quizContainer');
  const results = document.getElementById('quizResults');
  const progress = document.querySelector('.quiz-progress');
  const questions = document.querySelectorAll('.quiz-question');
  const progressFill = document.getElementById('quizProgress');
  const currentQ = document.getElementById('currentQ');
  const scoreRing = document.getElementById('scoreRing');
  
  // Reset UI
  container.style.display = 'block';
  progress.style.display = 'flex';
  results.classList.remove('active');
  
  questions.forEach((q, i) => {
    q.classList.toggle('active', i === 0);
    q.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  });
  
  progressFill.style.width = '16.66%';
  currentQ.textContent = '1';
  scoreRing.style.strokeDashoffset = '339';
}

// ─────────────────────────────────────────────────────────────────
// ROI CALCULATOR
// ─────────────────────────────────────────────────────────────────

function initCalculator() {
  const revenue = document.getElementById('calcRevenue');
  const team = document.getElementById('calcTeam');
  const hours = document.getElementById('calcHours');
  const rate = document.getElementById('calcRate');
  const response = document.getElementById('calcResponse');
  
  if (!revenue) return;
  
  const updateCalc = () => {
    const revenueVal = parseInt(revenue.value);
    const teamVal = parseInt(team.value);
    const hoursVal = parseInt(hours.value);
    const rateVal = parseInt(rate.value);
    const responseVal = parseFloat(response.value);
    
    // Update display values
    document.getElementById('calcRevenueValue').textContent = `€${revenueVal.toLocaleString()}`;
    document.getElementById('calcTeamValue').textContent = `${teamVal} ${teamVal === 1 ? 'person' : 'people'}`;
    document.getElementById('calcHoursValue').textContent = `${hoursVal} hours`;
    document.getElementById('calcRateValue').textContent = `€${rateVal}/hour`;
    document.getElementById('calcResponseValue').textContent = responseVal < 1 ? `${responseVal * 60} minutes` : `${responseVal} hours`;
    
    // Calculate losses
    const weeklyHours = teamVal * hoursVal;
    const annualHours = weeklyHours * 52;
    const laborLoss = annualHours * rateVal * 0.6; // 60% could be automated
    
    // Lead loss calculation (based on response time)
    const leadLossMultiplier = Math.min(responseVal / 2, 1) * 0.3; // Up to 30% loss
    const leadLoss = revenueVal * 12 * leadLossMultiplier;
    
    const totalLoss = Math.round(laborLoss + leadLoss);
    const lossPercent = Math.round((totalLoss / (revenueVal * 12)) * 100);
    
    // Update results
    document.getElementById('lossTime').textContent = annualHours.toLocaleString();
    document.getElementById('lossLabor').textContent = `€${Math.round(laborLoss).toLocaleString()}`;
    document.getElementById('lossLeads').textContent = `€${Math.round(leadLoss).toLocaleString()}`;
    document.getElementById('lossTotal').textContent = `€${totalLoss.toLocaleString()}`;
    document.getElementById('lossPercent').textContent = `${Math.min(lossPercent, 100)}%`;
  };
  
  [revenue, team, hours, rate, response].forEach(input => {
    input.addEventListener('input', updateCalc);
  });
  
  updateCalc();
}

// ─────────────────────────────────────────────────────────────────
// AUTOMATION SCANNER
// ─────────────────────────────────────────────────────────────────

const automationData = {
  agency: {
    title: 'Agency / Consultancy',
    items: [
      { icon: '💬', name: 'Client Communication', desc: 'Automated responses and follow-ups', impact: 'high' },
      { icon: '📋', name: 'Proposal Generation', desc: 'AI-assisted proposal writing', impact: 'high' },
      { icon: '📊', name: 'Reporting', desc: 'Automated client reports', impact: 'medium' },
      { icon: '🎯', name: 'Lead Qualification', desc: 'AI chatbot for prospect screening', impact: 'high' },
      { icon: '📅', name: 'Scheduling', desc: 'Automated meeting booking', impact: 'medium' },
      { icon: '📧', name: 'Email Sequences', desc: 'Nurture campaigns on autopilot', impact: 'high' },
      { icon: '🔍', name: 'Competitor Research', desc: 'Automated market intelligence', impact: 'medium' },
      { icon: '✍️', name: 'Content Creation', desc: 'AI-generated blog and social content', impact: 'high' }
    ],
    hours: '25+',
    count: 8
  },
  ecommerce: {
    title: 'E-commerce / Retail',
    items: [
      { icon: '💬', name: 'Customer Support', desc: '24/7 AI chat for order inquiries', impact: 'high' },
      { icon: '📦', name: 'Order Updates', desc: 'Automated shipping notifications', impact: 'medium' },
      { icon: '🔄', name: 'Returns Processing', desc: 'Self-service returns handling', impact: 'high' },
      { icon: '🛒', name: 'Abandoned Cart', desc: 'AI-powered recovery sequences', impact: 'high' },
      { icon: '⭐', name: 'Review Requests', desc: 'Automated review collection', impact: 'medium' },
      { icon: '📊', name: 'Inventory Alerts', desc: 'Smart stock level monitoring', impact: 'medium' },
      { icon: '🎯', name: 'Product Recommendations', desc: 'AI-powered upselling', impact: 'high' },
      { icon: '📧', name: 'Email Marketing', desc: 'Personalized campaigns at scale', impact: 'high' }
    ],
    hours: '30+',
    count: 8
  },
  saas: {
    title: 'SaaS / Software',
    items: [
      { icon: '💬', name: 'User Onboarding', desc: 'AI-guided product tours', impact: 'high' },
      { icon: '🎫', name: 'Support Tickets', desc: 'Automated first-line support', impact: 'high' },
      { icon: '📚', name: 'Documentation', desc: 'AI-assisted help articles', impact: 'medium' },
      { icon: '🔔', name: 'Feature Announcements', desc: 'Automated release comms', impact: 'medium' },
      { icon: '📊', name: 'Usage Analytics', desc: 'Automated health scoring', impact: 'high' },
      { icon: '🎯', name: 'Trial Conversion', desc: 'AI-powered upgrade nudges', impact: 'high' },
      { icon: '📧', name: 'Drip Campaigns', desc: 'Lifecycle email automation', impact: 'high' },
      { icon: '💰', name: 'Churn Prevention', desc: 'AI risk detection and outreach', impact: 'high' }
    ],
    hours: '20+',
    count: 8
  },
  coaching: {
    title: 'Coaching / Training',
    items: [
      { icon: '📅', name: 'Session Booking', desc: 'AI calendar management', impact: 'high' },
      { icon: '💬', name: 'Lead Qualification', desc: 'Chatbot for prospect screening', impact: 'high' },
      { icon: '📧', name: 'Follow-up Sequences', desc: 'Automated nurture campaigns', impact: 'high' },
      { icon: '📋', name: 'Intake Forms', desc: 'AI-processed client onboarding', impact: 'medium' },
      { icon: '🎬', name: 'Content Creation', desc: 'AI video and course materials', impact: 'high' },
      { icon: '📊', name: 'Progress Tracking', desc: 'Automated client reports', impact: 'medium' },
      { icon: '🔔', name: 'Reminders', desc: 'Session and homework reminders', impact: 'medium' },
      { icon: '💰', name: 'Payment Collection', desc: 'Automated invoicing', impact: 'medium' }
    ],
    hours: '20+',
    count: 8
  },
  services: {
    title: 'Professional Services',
    items: [
      { icon: '💬', name: 'Client Inquiries', desc: 'AI-powered initial response', impact: 'high' },
      { icon: '📋', name: 'Document Processing', desc: 'AI document analysis', impact: 'high' },
      { icon: '📅', name: 'Appointment Scheduling', desc: 'Automated booking system', impact: 'medium' },
      { icon: '📧', name: 'Client Updates', desc: 'Automated status communications', impact: 'medium' },
      { icon: '🔍', name: 'Research', desc: 'AI-assisted case research', impact: 'high' },
      { icon: '📊', name: 'Reporting', desc: 'Automated client reports', impact: 'medium' },
      { icon: '💰', name: 'Billing', desc: 'Automated time tracking and invoicing', impact: 'medium' },
      { icon: '📚', name: 'Knowledge Base', desc: 'AI-searchable internal docs', impact: 'medium' }
    ],
    hours: '22+',
    count: 8
  },
  local: {
    title: 'Local Business',
    items: [
      { icon: '📞', name: 'Phone Handling', desc: 'AI voice agent for calls', impact: 'high' },
      { icon: '📅', name: 'Appointment Booking', desc: 'Online scheduling system', impact: 'high' },
      { icon: '💬', name: 'Customer Questions', desc: 'AI chat for common inquiries', impact: 'high' },
      { icon: '⭐', name: 'Review Management', desc: 'Automated review requests', impact: 'medium' },
      { icon: '📧', name: 'Email Marketing', desc: 'Local customer campaigns', impact: 'medium' },
      { icon: '🔔', name: 'Appointment Reminders', desc: 'Automated SMS/email reminders', impact: 'high' },
      { icon: '📊', name: 'Customer Follow-up', desc: 'Post-service feedback', impact: 'medium' },
      { icon: '🎯', name: 'Lead Capture', desc: 'Website and social leads', impact: 'high' }
    ],
    hours: '18+',
    count: 8
  }
};

function initScanner() {
  const buttons = document.querySelectorAll('.business-type');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      showScannerResults(type);
    });
  });
}

function showScannerResults(type) {
  const selection = document.getElementById('scannerSelection');
  const results = document.getElementById('scannerResults');
  const list = document.getElementById('automationList');
  const title = document.getElementById('businessTypeTitle');
  const count = document.getElementById('automationCount');
  const hours = document.getElementById('automationHours');
  
  const data = automationData[type];
  
  // Update UI
  selection.classList.add('hidden');
  results.classList.remove('hidden');
  
  title.textContent = data.title;
  count.textContent = data.count;
  hours.textContent = data.hours + ' hrs';
  
  // Build list
  list.innerHTML = data.items.map(item => `
    <div class="automation-item">
      <span class="item-icon">${item.icon}</span>
      <div class="item-content">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      <span class="item-impact ${item.impact}">${item.impact.toUpperCase()}</span>
    </div>
  `).join('');
}

function resetScanner() {
  const selection = document.getElementById('scannerSelection');
  const results = document.getElementById('scannerResults');
  
  selection.classList.remove('hidden');
  results.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────────
// LEAD CAPTURE
// ─────────────────────────────────────────────────────────────────

function submitCapture(event) {
  event.preventDefault();
  
  const form = document.getElementById('captureForm');
  const success = document.getElementById('captureSuccess');
  
  const email = form.querySelector('input[name="email"]').value;
  console.log('Email captured:', email);
  
  form.style.display = 'none';
  success.classList.remove('hidden');
}
