/* ═══════════════════════════════════════════════════════════════
   ZOOM GROWTH - Core Scripts
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFAQ();
  initScrollAnimations();
  initFlowAnimation();
  initForms();
});

// ─────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────

function initNav() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
  
  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        // Close others
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        // Toggle current
        item.classList.toggle('active');
      });
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────────

function initScrollAnimations() {
  const elements = document.querySelectorAll('.glass-card, .problem-card, .service-card, .proof-card, .process-step, .pricing-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 50);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─────────────────────────────────────────────────────────────────
// FLOW ANIMATION
// ─────────────────────────────────────────────────────────────────

function initFlowAnimation() {
  const nodes = document.querySelectorAll('.flow-node');
  if (!nodes.length) return;
  
  let currentNode = 0;
  
  setInterval(() => {
    nodes.forEach(node => node.classList.remove('active'));
    currentNode = (currentNode + 1) % nodes.length;
    
    for (let i = 0; i <= currentNode; i++) {
      nodes[i].classList.add('active');
    }
  }, 1500);
}

// ─────────────────────────────────────────────────────────────────
// FORMS
// ─────────────────────────────────────────────────────────────────

function initForms() {
  // Any general form initialization
}

async function submitContact(event) {
  event.preventDefault();
  
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Disable button while submitting
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Sending...</span>';
  
  // Send to GHL webhook
  const ghlWebhook = 'https://services.leadconnectorhq.com/hooks/uI0j6ohgXfotkrh6SDU1/webhook-trigger/3a8cc059-8b73-4366-a495-395ed0b9c985';
  
  try {
    await fetch(ghlWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        source: 'ZOOM Growth Website'
      })
    });
    
    // Show success
    form.style.display = 'none';
    success.classList.add('active');
    
    // Track
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        'event_category': 'Contact',
        'event_label': data.businessType
      });
    }
  } catch (error) {
    console.error('Form submission error:', error);
    // Still show success (webhook likely worked, no-cors hides response)
    form.style.display = 'none';
    success.classList.add('active');
  }
}

// ─────────────────────────────────────────────────────────────────
// PARALLAX ON ORBS
// ─────────────────────────────────────────────────────────────────

document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.gradient-orb');
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  
  orbs.forEach((orb, index) => {
    const factor = (index + 1) * 0.3;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// ─────────────────────────────────────────────────────────────────
// SMOOTH SCROLL
// ─────────────────────────────────────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
