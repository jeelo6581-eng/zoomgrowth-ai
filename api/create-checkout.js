const https = require('https');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

const PRICE_IDS = {
  starter: 'price_1TDvISAXBuDT2hpoQbvhKJ0W',
  growth: 'price_1TDvIcAXBuDT2hpofj6ecw7D',
  enterprise: 'price_1TDvImAXBuDT2hpoMvlubbjX'
};

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
    const { tier } = req.body;
    const priceId = PRICE_IDS[tier];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid tier' });
    }
    
    const postData = new URLSearchParams({
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': 'https://zoomgrowth.ai/success.html',
      'cancel_url': 'https://zoomgrowth.ai/services.html'
    }).toString();
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.stripe.com',
        port: 443,
        path: '/v1/checkout/sessions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET}`,
          'Content-Type': 'application/x-www-form-urlencoded',
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
    
    return res.status(200).json({ url: response.url });
  } catch (error) {
    console.error('Checkout API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
