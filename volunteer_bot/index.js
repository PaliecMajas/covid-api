const express = require('express');
const app = express();
const axios = require('axios');

/**
 * Accepts information about new volunteers and posts it to Slack
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
app.post('/', async (req, res) => {
    const slackHookUrl = process.env.SLACK_HOOK_URL;

    const reqData = req.body;
    const fullName = `${reqData['first-name']} ${reqData['last-name']}`;
    const phone = reqData['phone'];

    const slackData = {text: `New volunteer applied!\nName: ${fullName}\nPhone: ${phone}`};

    console.log(`[D] Slack webhook call ${JSON.stringify(slackData)} -> ${slackHookUrl}`);
    await axios.post(slackHookUrl, slackData);
    res.send("OK");
});

exports.volunteer_bot = app;
