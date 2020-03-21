const axios = require('axios');


class Slack {
    async newMessage(authorName, cardUri) {
        const uri = 'https://hooks.slack.com/services/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';
        const data = {
            text: `New order placed! From: ${authorName}. Go check it out ${cardUri}`
        };
        console.log(`[D] Slack webhook call ${JSON.stringify(data)} -> ${uri}`);
        await axios.post(uri, data);
    }
}

module.exports = Slack;
