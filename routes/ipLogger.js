const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const ipData = {
      ip: req.ip,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    };

    await axios.post(process.env.IP_WEBHOOK_URL, {
      content: '🔍 New IP Log Entry',
      embeds: [{
        title: 'Visitor Information',
        fields: [
          { name: 'IP Address', value: ipData.ip },
          { name: 'User Agent', value: ipData.headers['user-agent'] || 'Unknown' },
          { name: 'Referrer', value: ipData.headers.referer || 'Direct' },
          { name: 'Location', value: 'Fetching...' }
        ],
        timestamp: ipData.timestamp
      }]
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('IP Logger Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
