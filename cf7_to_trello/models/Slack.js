const axios = require('axios');

class Slack {
    async newMessage(authorName, cardUri) {
        const paliecMajasSlackUri = 'https://hooks.slack.com/services/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';
        const data = {
            text: `New order placed! From: ${authorName}. Go check it out ${cardUri}`
        };
        console.log(`[D] Slack webhook call ${JSON.stringify(data)} -> ${paliecMajasSlackUri}`);
        await axios.post(paliecMajasSlackUri, data);
    }
}

module.exports = Slack;
