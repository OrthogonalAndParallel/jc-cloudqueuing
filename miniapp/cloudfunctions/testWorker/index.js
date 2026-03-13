const cloud = require('wx-server-sdk');
const https = require('https');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('JSON parse failed: ' + raw)); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
  });
}

exports.main = async (event, context) => {
  try {
    const result = await httpsGet(
      'https://jczen.dpdns.org/api/list?queueId=default'
    );
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};


// exports.main = async (event, context) => {
//   return new Promise((resolve) => {
//     https.get('https://www.baidu.com', { timeout: 5000 }, (res) => {
//       resolve({ ok: true, statusCode: res.statusCode });
//     }).on('error', (e) => {
//       resolve({ ok: false, error: e.message });
//     });
//   });
// };