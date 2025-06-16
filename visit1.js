
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1384050469898424340/pZhAjnIlRpde_GXgy_8zgAI3vVNQ6Je4s0k-jWlHhJJgRzlbMayouIMHYO6VoFlHb9z6';

// Function to collect visitor information
async function collectVisitorInfo() {
    try {
        // Get IP and location info
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        
        // Get approximate location (using free IP geolocation API)
        let location = 'Unknown';
        try {
            const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const locationData = await locationResponse.json();
            location = `${locationData.city}, ${locationData.region}, ${locationData.country_name}`;
        } catch (e) {
            console.log('Location detection failed');
        }
        
        // Get device/browser info
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        
        // Get referral source
        let referralSource = document.referrer || 'Direct visit';
        if (referralSource.includes('instagram.com')) referralSource = 'Instagram';
        if (referralSource.includes('tiktok.com')) referralSource = 'TikTok';
        if (referralSource.includes('facebook.com')) referralSource = 'Facebook';
        
        // Get current page URL
        const pageUrl = window.location.href;
        
        // Get visit time
        const visitTime = new Date().toLocaleString();
        
        return {
            ip,
            location,
            userAgent,
            platform,
            screenResolution,
            referralSource,
            pageUrl,
            visitTime
        };
    } catch (error) {
        console.error('Error collecting visitor info:', error);
        return null;
    }
}

// Function to send data to Discord
async function sendToDiscord(visitorInfo) {
    if (!visitorInfo) return;
    
    try {
        // Format the Discord message
        const embed = {
            title: '🚀 New Website Visitor',
            color: 0x00ff00,
            fields: [
                {
                    name: 'IP Address',
                    value: visitorInfo.ip,
                    inline: true
                },
                {
                    name: 'Location',
                    value: visitorInfo.location,
                    inline: true
                },
                {
                    name: 'Device',
                    value: visitorInfo.platform,
                    inline: true
                },
                {
                    name: 'Browser',
                    value: visitorInfo.userAgent,
                    inline: false
                },
                {
                    name: 'Screen Resolution',
                    value: visitorInfo.screenResolution,
                    inline: true
                },
                {
                    name: 'Referral Source',
                    value: visitorInfo.referralSource,
                    inline: true
                },
                {
                    name: 'Page Visited',
                    value: visitorInfo.pageUrl,
                    inline: false
                },
                {
                    name: 'Visit Time',
                    value: visitorInfo.visitTime,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };
        
        // Send to Discord
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send to Discord:', response.status);
        }
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}

// Main function to run when page loads
async function trackVisitor() {
    const visitorInfo = await collectVisitorInfo();
    await sendToDiscord(visitorInfo);
}

// Run the tracker
trackVisitor();
