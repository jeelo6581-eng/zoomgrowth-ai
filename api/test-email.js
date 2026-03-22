const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Debug: Check if env var exists
  const hasKey = !!RESEND_API_KEY;
  const keyPrefix = RESEND_API_KEY ? RESEND_API_KEY.substring(0, 10) + '...' : 'NOT SET';
  
  if (!RESEND_API_KEY) {
    return res.status(200).json({ 
      error: 'RESEND_API_KEY not set',
      hasKey,
      keyPrefix
    });
  }
  
  // Try to send email
  const postData = JSON.stringify({
    from: 'ZOOM Growth <hello@zoomgrowth.ai>',
    to: 'zoom.arlind@gmail.com',
    subject: 'Test from Vercel API - ' + new Date().toISOString(),
    html: '<h1>Email from Vercel function works!</h1>'
  });
  
  try {
    const result = await new Promise((resolve, reject) => {
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
            resolve({ statusCode: response.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: response.statusCode, body: data });
          }
        });
      });
      
      request.on('error', (e) => reject(e));
      request.write(postData);
      request.end();
    });
    
    return res.status(200).json({ 
      success: true, 
      hasKey,
      keyPrefix,
      resendResponse: result 
    });
  } catch (error) {
    return res.status(200).json({ 
      error: error.message,
      hasKey,
      keyPrefix 
    });
  }
};
