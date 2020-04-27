// todo danielz: remove this later
require('@google-cloud/debug-agent').start();
const express = require('express');
const app = express();
const Trello = require('./models/Trello');

const LOCATION_SEP = ',,';

// Check environment
if (!process.env.GCP_PROJECT) {
    console.log("[i] Not in the cloud: entering debug mode");
    // Set up body parsing middleware
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    const port = process.env.PORT || 9000;
    app.listen(port, () => {
        console.log('[i] Service listening on port', port);
    });
}

/**
 * Transforms the data coming from the website to what we want to store on Trello
 */
function getWebsiteFormData(body) {
    let location = body['location'];
    let zelosGroupId = null;
    // Due to difficulties adopting CF7 behaviour, we're temporarily using the location field to send both
    // the name of the city and its  Zelos group ID, separated by ",,". We're not sending this for all values.
    if (location.includes(LOCATION_SEP)) {
        const strings = location.split(LOCATION_SEP);
        location = strings[0];
        zelosGroupId = strings[1];
    }

    return {
        'request': body['request'],
        'name': body['full_name'],
        'phone': body['phone'],
        'location': location,
        'neighborhood': body['neighborhood'],
        'zelos_group_id': zelosGroupId,
        'address': body['address'],
        'email_address': body['email_address'],
        'how-did-you-hear': body['how-did-you-hear'],
        'how-did-you-hear-other': body['how-did-you-hear-other'],
    }
}

// Default route
app.get('/', (req, res) => {
    res.send("Yes hello");
});

// Get data from CF7 Webhook and create trello card
app.post('/', async (req, res) => {
    console.log('[i] New request from CF7');
    const trello = new Trello();
    await trello.init();
    try {
        const data = getWebsiteFormData(req.body);
        console.log('[i] getWebsiteFormData: ' + JSON.stringify(data));
        await trello.newCard(data);
        res.send("Success!\n");
    } catch (err) {
        res.send("Failed because of reasons, error has been logged " + err.message);
    }
});

exports.cf7_to_trello = app;
