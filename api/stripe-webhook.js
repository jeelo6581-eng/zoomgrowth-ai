const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/uI0j6ohgXfotkrh6SDU1/webhook-trigger/3a8cc059-8b73-4366-a495-395ed0b9c985';

// Purchase email template
const purchaseEmail = (firstName, tier) => ({
  subject: `Payment Confirmed — Welcome to ZOOM Growth ${tier}!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #10b981;">Payment Successful! ✅</h1>
      <p>Hey ${firstName},</p>
      <p>Your payment for the <strong>${tier}</strong> package has been confirmed. Your AI automation journey starts now.</p>
      <p><strong>What happens next:</strong></p>
      <ol>
        <li><strong>Within 24 hours:</strong> We'll reach out to schedule your kickoff call</li>
        <li><strong>Week 1:</strong> Discovery & planning — we audit your business and design your AI systems</li>
        <li><strong>Weeks 2-4:</strong> Build & integration — we build and deploy your automation</li>
        <li><strong>Launch:</strong> Your AI systems go live</li>
      </ol>
      <p>If you have any questions, reply to this email.</p>
      <p style="margin-top: 30px;">Excited to work with you!<br><strong>The ZOOM Growth Team</strong></p>
    </div>
  `
});

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
      console.error('Email error:', e);
      reject(e);
    });
    request.write(postData);
    request.end();
  });
}

async function sendToGHL(data) {
  const ghlData = JSON.stringify(data);
  
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
      console.error('GHL error:', e);
      reject(e);
    });
    request.write(ghlData);
    request.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const event = req.body;
    
    console.log('Webhook received:', event.type);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email;
      const name = session.customer_details?.name || 'there';
      const firstName = name.split(' ')[0];
      
      console.log('Purchase detected:', { email, name, amount: session.amount_total });
      
      // Determine tier from amount
      let tier = 'Starter';
      if (session.amount_total >= 999900) tier = 'Enterprise';
      else if (session.amount_total >= 499900) tier = 'Growth';
      
      // Send purchase confirmation email
      let emailResult = null;
      if (email) {
        console.log('Sending purchase email to:', email);
        emailResult = await sendEmail(email, purchaseEmail(firstName, tier));
        console.log('Email result:', JSON.stringify(emailResult));
      }
      
      // Send to GHL
      const ghlResult = await sendToGHL({
        firstName: firstName,
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: email,
        source: `ZOOM Growth - ${tier} Purchase`
      });
      console.log('GHL result:', ghlResult);
      
      return res.status(200).json({ received: true, emailSent: !!emailResult });
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
};
