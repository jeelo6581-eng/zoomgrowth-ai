const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/uI0j6ohgXfotkrh6SDU1/webhook-trigger/3a8cc059-8b73-4366-a495-395ed0b9c985';

// Email templates
const EMAIL_TEMPLATES = {
  welcome: (firstName) => ({
    subject: `Welcome to ZOOM Growth, ${firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #0ea5e9;">Welcome to ZOOM Growth! ⚡</h1>
        <p>Hey ${firstName},</p>
        <p>Thanks for reaching out. You've taken the first step toward automating your business with AI.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Our team will review your submission within 24 hours</li>
          <li>We'll reach out to schedule your free strategy call</li>
          <li>On the call, we'll map out exactly what we can automate for you</li>
        </ul>
        <p>In the meantime, check out how our AI systems work:</p>
        <p><a href="https://zoomgrowth.ai/services.html" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Explore Our Services</a></p>
        <p style="margin-top: 30px;">Talk soon,<br><strong>The ZOOM Growth Team</strong></p>
      </div>
    `
  }),
  quizResult: (email, score) => ({
    subject: `Your AI Readiness Score: ${score}/100`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #0ea5e9;">Your AI Readiness Results 📊</h1>
        <p>You scored <strong style="font-size: 24px; color: #6366f1;">${score}/100</strong> on our AI Readiness Assessment.</p>
        <p>${score >= 75 ? "You're ELITE READY — your business is primed for advanced automation." : score >= 50 ? "You have a SCALING OPPORTUNITY — there's significant potential for AI to transform your operations." : "You're at the FOUNDATION STAGE — AI can help you build the systems you need to scale."}</p>
        <p><strong>Based on your score, we recommend:</strong></p>
        <ul>
          ${score >= 75 ? '<li>Advanced AI sales systems</li><li>Multi-channel automation</li><li>AI call center setup</li>' : score >= 50 ? '<li>Lead automation systems</li><li>AI chatbot deployment</li><li>Workflow automation</li>' : '<li>Basic AI chatbot</li><li>Lead capture systems</li><li>CRM integration</li>'}
        </ul>
        <p><a href="https://zoomgrowth.ai/#contact" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Get Your Custom AI Plan</a></p>
        <p style="margin-top: 30px;">— ZOOM Growth Team</p>
      </div>
    `
  })
};

// Send email via Resend (fixed version)
async function sendEmail(to, template) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set');
    return null;
  }
  
  const postData = JSON.stringify({
    from: 'ZOOM Growth <hello@zoomgrowth.ai>',
    to: to,
    subject: template.subject,
    html: template.html
  });
  
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    request.on('error', (e) => {
      console.error('Email send error:', e);
      reject(e);
    });
    
    request.write(postData);
    request.end();
  });
}

// Send to GHL
async function sendToGHL(data) {
  const ghlData = JSON.stringify({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email,
    phone: data.phone || '',
    source: data.source || 'ZOOM Growth Website'
  });
  
  return new Promise((resolve, reject) => {
    const url = new URL(GHL_WEBHOOK);
    const request = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(ghlData)
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });
    
    request.on('error', (e) => {
      console.error('GHL send error:', e);
      reject(e);
    });
    
    request.write(ghlData);
    request.end();
  });
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    
    console.log('Received lead data:', JSON.stringify(data));
    
    // Send to GHL
    const ghlResult = await sendToGHL(data);
    console.log('GHL result:', ghlResult);
    
    // Send welcome email if firstName and email exist
    let emailResult = null;
    if (data.firstName && data.email) {
      console.log('Sending welcome email to:', data.email);
      emailResult = await sendEmail(data.email, EMAIL_TEMPLATES.welcome(data.firstName));
      console.log('Email result:', JSON.stringify(emailResult));
    }
    
    // Send quiz result email if quizScore exists
    let quizEmailResult = null;
    if (data.quizScore && data.email) {
      console.log('Sending quiz email to:', data.email);
      quizEmailResult = await sendEmail(data.email, EMAIL_TEMPLATES.quizResult(data.email, data.quizScore));
      console.log('Quiz email result:', JSON.stringify(quizEmailResult));
    }
    
    return res.status(200).json({ 
      success: true,
      emailSent: !!emailResult,
      quizEmailSent: !!quizEmailResult
    });
  } catch (error) {
    console.error('Lead API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
