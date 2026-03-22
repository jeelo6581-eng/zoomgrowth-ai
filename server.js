const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3000;
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
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
  }),
  purchase: (firstName, tier) => ({
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
  })
};

// Send email via Resend
async function sendEmail(to, template) {
  if (!RESEND_API_KEY) return;
  
  const postData = JSON.stringify({
    from: 'ZOOM Growth <hello@zoomgrowth.ai>',
    to: to,
    subject: template.subject,
    html: template.html
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const PRICES = {
  starter: 'price_1TDvISAXBuDT2hpoQbvhKJ0W',
  growth: 'price_1TDvIcAXBuDT2hpofj6ecw7D',
  enterprise: 'price_1TDvImAXBuDT2hpoMvlubbjX'
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  
  // Handle lead capture API
  if (req.method === 'POST' && req.url === '/api/lead') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Send to GHL
        const ghlData = JSON.stringify({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email,
          phone: data.phone || '',
          source: data.source || 'ZOOM Growth Website'
        });
        
        const ghlReq = https.request(GHL_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': ghlData.length }
        });
        ghlReq.write(ghlData);
        ghlReq.end();
        
        // Send welcome email
        if (data.firstName && data.email) {
          await sendEmail(data.email, EMAIL_TEMPLATES.welcome(data.firstName));
        }
        
        // Send quiz result email
        if (data.quizScore && data.email) {
          await sendEmail(data.email, EMAIL_TEMPLATES.quizResult(data.email, data.quizScore));
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // Handle Stripe webhook for purchase emails
  if (req.method === 'POST' && req.url === '/api/stripe-webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const email = session.customer_details?.email;
          const name = session.customer_details?.name || 'there';
          const firstName = name.split(' ')[0];
          
          // Determine tier from amount
          let tier = 'Starter';
          if (session.amount_total >= 999900) tier = 'Enterprise';
          else if (session.amount_total >= 499900) tier = 'Growth';
          
          // Send purchase confirmation email
          if (email) {
            await sendEmail(email, EMAIL_TEMPLATES.purchase(firstName, tier));
          }
          
          // Send to GHL
          const ghlData = JSON.stringify({
            firstName: firstName,
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: email,
            source: `ZOOM Growth - ${tier} Purchase`
          });
          
          const ghlReq = https.request(GHL_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': ghlData.length }
          });
          ghlReq.write(ghlData);
          ghlReq.end();
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // Handle Stripe checkout API
  if (req.method === 'POST' && req.url === '/api/create-checkout') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { tier } = JSON.parse(body);
        const priceId = PRICES[tier];
        
        if (!priceId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid tier' }));
          return;
        }
        
        // Create Stripe checkout session
        const postData = new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${req.headers.origin || 'https://zoomgrowth.ai'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': `${req.headers.origin || 'https://zoomgrowth.ai'}/services.html`
        }).toString();
        
        const stripeReq = https.request({
          hostname: 'api.stripe.com',
          port: 443,
          path: '/v1/checkout/sessions',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        }, (stripeRes) => {
          let data = '';
          stripeRes.on('data', chunk => data += chunk);
          stripeRes.on('end', () => {
            try {
              const session = JSON.parse(data);
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ sessionId: session.id }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Stripe error' }));
            }
          });
        });
        
        stripeReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
        
        stripeReq.write(postData);
        stripeReq.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback
        fs.readFile(path.join(__dirname, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      // Cache static assets
      const cacheControl = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'].includes(ext)
        ? 'public, max-age=2592000, immutable'
        : 'no-cache';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
