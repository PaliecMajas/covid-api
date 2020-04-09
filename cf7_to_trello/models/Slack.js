const axios = require('axios');

class Slack {
    async newMessage(authorName, cardUri) {
        const paliecMajasSlackUri = process.env.SLACK_HOOK_URL;
        const data = {
            text: `New order placed! From: ${authorName}. Go check it out ${cardUri}`
        };
        console.log(`[D] Slack webhook call ${JSON.stringify(data)} -> ${paliecMajasSlackUri}`);
        await axios.post(paliecMajasSlackUri, data);
    }
}

module.exports = Slack;
