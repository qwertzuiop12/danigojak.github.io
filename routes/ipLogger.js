const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const visitorData = req.body;
        
        // Prepare Discord embed (similar to your frontend version)
        const deviceIcons = {
            'Mobile': '📱',
            'Tablet': '📱',
            'iOS': '',
            'Android': '🤖',
            'Desktop': '💻'
        };
        const deviceIcon = deviceIcons[visitorData.device] || '💻';

        await axios.post(process.env.IP_WEBHOOK_URL, {
            username: 'Dani Gojak Visitor Tracker',
            avatar_url: 'https://i.imgur.com/7YgX21T.png',
            embeds: [{
                title: '🚀 New Website Visitor',
                color: 0x00FF88,
                thumbnail: {
                    url: `https://flagcdn.com/w160/${visitorData.country_code.toLowerCase()}.png`
                },
                fields: [
                    {
                        name: '🌍 Location',
                        value: `**Country:** ${visitorData.country}\n**Region:** ${visitorData.region}\n**City:** ${visitorData.city}\n**Postal:** ${visitorData.postal}`,
                        inline: true
                    },
                    {
                        name: '🖥️ Device',
                        value: `${deviceIcon} **Type:** ${visitorData.device}\n**OS:** ${visitorData.platform}\n**Screen:** ${visitorData.screen}\n**Language:** ${visitorData.language}`,
                        inline: true
                    },
                    {
                        name: '📡 Network',
                        value: `**IP:** ||${visitorData.ip}||\n**ISP:** ${visitorData.isp}\n**Timezone:** ${visitorData.timezone}`,
                        inline: false
                    },
                    {
                        name: '🔗 Referral',
                        value: visitorData.referrer.includes('http') ? `[Click here](${visitorData.referrer})` : visitorData.referrer,
                        inline: true
                    },
                    {
                        name: '🕒 Visit Time',
                        value: new Date(visitorData.timestamp).toLocaleString(),
                        inline: true
                    }
                ],
                footer: {
                    text: 'Visitor Tracking System • ' + new Date().getFullYear(),
                    icon_url: 'https://i.imgur.com/7YgX21T.png'
                },
                timestamp: visitorData.timestamp
            }]
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('IP Logger Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
