// Configuration
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1384050469898424340/pZhAjnIlRpde_GXgy_8zgAI3vVNQ6Je4s0k-jWlHhJJgRzlbMayouIMHYO6VoFlHb9z6';
const MAX_RETRIES = 2;
const TIMEOUT = 5000; // 5 seconds

// Enhanced IP fetch with multiple fallback services
async function getIP() {
    const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ipinfo.io/json'
    ];

    for (let i = 0; i < services.length; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
            
            const response = await fetch(services[i], { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) continue;
            
            const data = await response.json();
            return data.ip || data.query || 'Unknown';
        } catch (e) {
            console.debug(`IP service ${i} failed, trying next...`);
        }
    }
    return 'Unknown';
}

// Get comprehensive device info
function getDeviceInfo() {
    try {
        return {
            // Basic info
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            
            // Screen details
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            colorDepth: window.screen.colorDepth,
            orientation: window.screen.orientation?.type || 'Unknown',
            
            // Browser capabilities
            javaEnabled: navigator.javaEnabled ? 'Yes' : 'No',
            pdfViewerEnabled: navigator.pdfViewerEnabled ? 'Yes' : 'No',
            
            // Network info
            connectionType: navigator.connection?.effectiveType || 'Unknown',
            deviceMemory: navigator.deviceMemory || 'Unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            
            // Location info
            referrer: document.referrer || 'Direct',
            page: window.location.href,
            time: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    } catch (e) {
        console.error('Error collecting device info:', e);
        return { error: 'Failed to collect device info' };
    }
}

// Format the Discord message
function createDiscordMessage(ip, deviceInfo) {
    const fields = [
        { name: '🌐 IP Address', value: ip || 'Unknown', inline: true },
        { name: '🖥️ Platform', value: deviceInfo.platform || 'Unknown', inline: true },
        { name: '🔍 Language', value: deviceInfo.language || 'Unknown', inline: true },
        { name: '🖥️ Screen', value: deviceInfo.screenResolution || 'Unknown', inline: true },
        { name: '⏰ Time', value: `<t:${Math.floor(new Date(deviceInfo.time).getTime()/1000}:F>`, inline: true },
        { name: '🗺️ Timezone', value: deviceInfo.timezone || 'Unknown', inline: true },
        { name: '🔗 Referrer', value: deviceInfo.referrer.length > 100 ? 
            deviceInfo.referrer.substring(0, 100) + '...' : deviceInfo.referrer || 'Direct', inline: false },
        { name: '📄 Page', value: deviceInfo.page.length > 100 ? 
            deviceInfo.page.substring(0, 100) + '...' : deviceInfo.page || 'Unknown', inline: false }
    ];

    // Add additional fields if they exist
    if (deviceInfo.connectionType) {
        fields.push({ name: '📶 Connection', value: deviceInfo.connectionType, inline: true });
    }

    return {
        embeds: [{
            title: '👀 New Website Visitor',
            color: 0x5865F2, // Discord brand color
            fields: fields,
            footer: {
                text: 'Visitor Analytics',
                icon_url: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico'
            },
            timestamp: new Date().toISOString()
        }]
    };
}

// Send to Discord with retry logic
async function sendToDiscord(ip, deviceInfo) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const payload = createDiscordMessage(ip, deviceInfo);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
            
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) return true;
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            
            console.error('Discord webhook error:', response.status);
            return false;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === MAX_RETRIES - 1) return false;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
    return false;
}

// Main execution with error handling
async function trackVisitor() {
    try {
        if (typeof window === 'undefined') return; // Don't run in non-browser environments
        
        // Check for Do Not Track preference
        if (navigator.doNotTrack === "1") {
            console.log('Respecting DNT (Do Not Track) preference');
            return;
        }
        
        const ip = await getIP();
        const deviceInfo = getDeviceInfo();
        await sendToDiscord(ip, deviceInfo);
    } catch (error) {
        console.error('Visitor tracking failed:', error);
    }
}

// Start tracking with a slight delay to avoid blocking page load
if (document.readyState === 'complete') {
    setTimeout(trackVisitor, 1000);
} else {
    window.addEventListener('load', () => {
        setTimeout(trackVisitor, 1000);
    });
}
