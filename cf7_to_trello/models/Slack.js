const axios = require('axios');


class Slack {
    async newMessage(authorName, cardUri) {
        const hackForceSlackUri = 'https://hooks.slack.com/services/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';
        const paliecMajasSlackUri = 'https://hooks.slack.com/services/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';
        const data = {
            text: `New order placed! From: ${authorName}. Go check it out ${cardUri}`
        };
        console.log(`[D] Slack webhook call ${JSON.stringify(data)} -> ${hackForceSlackUri}`);
        await axios.post(hackForceSlackUri, data);
        console.log(`[D] Slack webhook call ${JSON.stringify(data)} -> ${paliecMajasSlackUri}`);
        await axios.post(paliecMajasSlackUri, data);
    }
}

module.exports = Slack;
