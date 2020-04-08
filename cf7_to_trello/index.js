const express = require('express');
const app = express();
const Trello = require('./models/Trello');

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

// Default route
app.get('/', (req, res) => {
    res.send("Yes hello");
});

// Get data from CF7 Webhook and create trello card
app.post('/', async (req, res) => {
    const trello = new Trello();
    await trello.init();
    try {
        let data = req.body;
        console.log('[i] New request from CF7 ' + JSON.stringify(data));
        await trello.newCard(data);
        res.send("Success!\n");
    } catch (err) {
        res.send("Failed because of reasons, error has been logged " + err.message);
    }
});

exports.cf7_to_trello = app;
