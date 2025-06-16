
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1384050469898424340/pZhAjnIlRpde_GXgy_8zgAI3vVNQ6Je4s0k-jWlHhJJgRzlbMayouIMHYO6VoFlHb9z6';

    // Simple IP fetch that works with most configurations
    async function getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    }

    // Get basic device info
    function getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Direct',
            page: window.location.href,
            time: new Date().toLocaleString()
        };
    }

    // Send to Discord
    async function sendToDiscord(ip, deviceInfo) {
        try {
            const embed = {
                title: '🌐 New Website Visitor',
                color: 0x00ff00,
                fields: [
                    { name: 'IP Address', value: ip, inline: true },
                    { name: 'Device', value: deviceInfo.platform, inline: true },
                    { name: 'Screen', value: deviceInfo.screen, inline: true },
                    { name: 'From', value: deviceInfo.referrer, inline: true },
                    { name: 'Page', value: deviceInfo.page, inline: false },
                    { name: 'Time', value: deviceInfo.time, inline: true }
                ]
            };

            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });

            if (!response.ok) {
                console.error('Discord webhook error:', response.status);
            }
        } catch (error) {
            console.error('Error sending to Discord:', error);
        }
    }

    // Main execution
    async function trackVisitor() {
        const ip = await getIP();
        const deviceInfo = getDeviceInfo();
        await sendToDiscord(ip, deviceInfo);
    }

    // Start tracking
    trackVisitor();
});
