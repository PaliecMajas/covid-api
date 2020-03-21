const axios = require('axios');
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const config = {
    "list": {
        "incoming": "",
        "approved": "",
        "rejected": ""
    },
    "key": process.env.TRELLO_KEY,
    "token": process.env.TRELLO_TOKEN,
    "board": process.env.TRELLO_BOARD
};

class Trello {
    constructor() {
        this.board = config.board;
        this.lists = {};
        this.cfields = {};
        this.authParams = `?key=${config.key}&token=${config.token}`;
    }
    async init() {
        await this.initLists();
        await this.initFields();
    }

    async initLists() {
        try {
            const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/lists${this.authParams}`);
            res.data.forEach(obj => {
                this.lists[obj.name.toLowerCase()] = obj.id;
            });
        } catch (err) {
            console.error(`[E] Couldn't get lists from Trello: ${err.message}`);
        }  
    }

    async initFields() {
        try {
            const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/customFields${this.authParams}`);
            res.data.forEach(obj => {
                this.cfields[obj.name.toLowerCase().replace(/\s.*/, '')] = obj.id;
            });
        } catch (err) {
            console.error(`[E] Couldn't get custom fields from Trello: ${err.message}`);
        }
        
    }

    async newCard(formFields) {
        const reqUri = `https://api.trello.com/1/cards${this.authParams}&pos=bottom&idList=${this.lists.incoming}`;
        try {
            const dataStoreEntity = this.formFieldsDataStoreEntity(formFields);
            console.log(`[D] Store into data store ${JSON.stringify(dataStoreEntity)}`);
            await this.storeEntity(dataStoreEntity);

            const res = await axios.post(reqUri, this.formFieldsTrelloCardData(formFields));

            dataStoreEntity.data.trelloId = res.data.id;
            await this.storeEntity(dataStoreEntity);

            this.addFields(res.data.id, formFields);
        } catch (err) {
            console.error(`[E] Error while creating Trello card: ${err.message} (${reqUri})`);
            return err;
        }
    }

    async addFields(cardId, formFields) {
        const formCustomFields = { ...formFields };
        delete formCustomFields.request;
        const requests = [];
        Object.keys(formCustomFields).forEach(item => {
            const field = this.cfields[item];
            const value = {
                "value": {
                    "text": formCustomFields[item]
                },
                "key": config.key,
                "token": config.token
            };
            requests.push([`https://api.trello.com/1/card/${cardId}/customField/${field}/item`, value]);
        });
        for (const req of requests) {
            try {
                await axios.put(req[0], req[1]);
            } catch (err) {
                console.error(`[E] Failed to update custom fields on card ${cardId}: ${err.message}`);
            }
        }
    }


    formFieldsDataStoreEntity(formFields) {
        const key = datastore.key('request');
        return {
            key: key,
            data: {
                request: formFields,
                createdOn: new Date().toUTCString(),
                region: formFields.location,
                trelloId: null
            }
        };
    }

    formFieldsTrelloCardData(formFields) {
        const maxContentLen = 160;
        const requestContent = formFields.request
            .replace(/(?:\r\n|\r|\n)/g, '; ');
        return {
            name: requestContent.length > maxContentLen
                ? requestContent.substring(0, maxContentLen - 3) + '...'
                : requestContent,
            desc: requestContent
        };
    }

    async storeEntity(requestEntity) {
        return datastore.save(requestEntity, (err, apiResponse) => {
            if (err) {
                console.error(`[E] Error while storing into data store: ${err.message} [${JSON.stringify(requestEntity)}]`);
            }
        });
    }
}

module.exports = Trello;
