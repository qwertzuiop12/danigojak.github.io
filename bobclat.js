// visitor-tracking.js
document.addEventListener('DOMContentLoaded', function() {
    // Discord webhook URL
    const webhookURL = 'https://discord.com/api/webhooks/1384050469898424340/pZhAjnIlRpde_GXgy_8zgAI3vVNQ6Je4s0k-jWlHhJJgRzlbMayouIMHYO6VoFlHb9z6';
    
    // Only track if on your domain
    if (!window.location.hostname.includes('danigojak.xyz')) {
        return;
    }

    // Collect and send visitor info
    async function trackVisitor() {
        try {
            // Get IP address
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const { ip } = await ipResponse.json();
            
            // Get geolocation data
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoResponse.json();
            
            // Prepare Discord message
            const embed = {
                title: "🚀 New Visitor Alert",
                color: 0x00ff88,
                fields: [
                    {
                        name: "🌍 Location",
                        value: `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Unknown'}`,
                        inline: true
                    },
                    {
                        name: "📌 IP",
                        value: `||${ip}||`,
                        inline: true
                    },
                    {
                        name: "📱 Device",
                        value: navigator.userAgent,
                        inline: false
                    },
                    {
                        name: "📅 Time",
                        value: new Date().toLocaleString(),
                        inline: true
                    },
                    {
                        name: "🔗 Page",
                        value: window.location.href,
                        inline: true
                    }
                ]
            };

            // Send to Discord
            await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: "@everyone New visitor!",
                    embeds: [embed]
                })
            });
        } catch (error) {
            console.error('Tracking error:', error);
        }
    }

    // Start tracking
    trackVisitor();
});
