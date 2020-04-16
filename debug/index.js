// A function to run integration test on GCP
const express = require('express');
const app = express();
const Logger = require('../lib/Logger');

const logger = new Logger();


app.get('/log/info', async (req, res) => {
    logger.info('This is an info message');
    res.send("Ok")
});

app.get('/log/warning', async (req, res) => {
    logger.warning('This is a warning message');
    res.send("Ok")
});

app.get('/log/error', async (req, res) => {
    logger.warning('This is an error message');
    res.send("Ok")
});

app.get('/log/exception', async (req, res) => {
    try {
        throw new Error('This is an exception!');
    } catch (e) {
        logger.exception(e);

    }
    res.send("Ok")
});

exports.debug = app;
