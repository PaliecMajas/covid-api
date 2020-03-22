const express = require('express');
const app = express();
const Trello = require('./models/Trello');
const Zelos = require('./models/Zelos');
const Text2Reach = require('./models/Text2Reach');

const sendSms = process.env.SEND_SMS === 'true' || false;

let endpoint = "";

// Check environment
if (!process.env.GCP_PROJECT) {
  console.log("[i] Not in the cloud");
  // Set up body parsing middleware
  const bodyParser = require('body-parser');
  endpoint = "debug";
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log('[i] Service listening on port', port);
  });
}

// Verification endpoints for setting up Trello webhooks
app.head(`/${endpoint}`, (req, res) => {
  res.send("OK");
});

app.get(`/${endpoint}`, (req, res) => {
  res.send("OK");
});

// Get data from Trello Webhook
app.post(`/${endpoint}`, async (req, res) => {
  const status = {};
  const action = {};
  const trello = new Trello(action.board);

  console.error(`[D] Webhook call with payload ${JSON.stringify(req.body)}`);

  if (req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
    status.old = req.body.action.data.listBefore.name.toLowerCase();
    status.new = req.body.action.data.listAfter.name.toLowerCase();
    action.card = req.body.action.data.card.id;
    action.board = req.body.action.data.board.id;
  }
  if (status.old === "incoming") {
    await trello.init();
    const labels = await trello.getLabels(action.card);
    const cardFields = await trello.getCustomFields(action.card);
    const taskData = parseCustomFields(cardFields, trello.customFields);
    taskData.description = await trello.getDesc(action.card);

    if (status.new === "approved") {
      if ( ! checkLabels(labels, status.new)) {
        const workspace = new Zelos();
        await workspace.init();
        const groupId = await workspace.findGroup(taskData.location);
        const task = await workspace.newTask(taskData, [groupId]);
        if (!(task instanceof Error)) {
          await trello.addComment(action.card, task);
          await trello.addLabel(action.card, status.new, "green");
          if (sendSms && taskData.phone !== '') {
            try {
              const text2Reach = new Text2Reach({API_KEY: process.env.T2R_API_KEY});
              await text2Reach.sendMessage(taskData.phone, 'Jūsu pieteikums apstiprināts');
              await trello.addLabel(action.card, "SMS sent", "blue");
            } catch (err) {
              console.error(`[E] Error while adding approved Trello label: ${err.message}`);
            }
          }
        }
      }
    }
    if (status.new === "rejected") {
      if (!checkLabels(labels, status.new)) {
        if (sendSms) {
          const cardFields = await trello.getCustomFields(action.card);
          const taskData = parseCustomFields(cardFields, trello.customFields);
          console.log(taskData);
          if (taskData.phone !== '') {
            try {
              const text2Reach = new Text2Reach({API_KEY: process.env.T2R_API_KEY});
              await text2Reach.sendMessage(taskData.phone, 'Jūsu pieteikums noraidīts');
              await trello.addLabel(action.card, "SMS sent", "blue");
            } catch (err) {
              console.error(`[E] Error while adding reject Trello label: ${err.message}`);
            }
          }
        }
        await trello.addLabel(action.card, status.new, "red");
      }
    }
  }
  res.send("OK");
});

function checkLabels(labels, status) {
  let allLabels = [];
  labels.forEach(obj => {
    allLabels.push(obj.name);
  });
  return allLabels.includes(status);
}

function parseCustomFields(cardFields, boardFields) {
  let taskData = {};
  cardFields.forEach(obj => {
    const value = obj.value.text;
    const label = getKeyByValue(boardFields, obj.idCustomField);
    taskData[label] = value;
  });
  return taskData;
}

function getKeyByValue(object, value) { 
  return Object.keys(object).find(key => object[key] === value); 
}

exports.trello_monitor = app;
