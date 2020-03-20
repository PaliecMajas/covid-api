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
            console.error(`[!] Couldn't get lists from Trello:\n${err.message}`);
        }  
    }

    async initFields() {
        try {
            const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/customFields${this.authParams}`);
            res.data.forEach(obj => {
                this.cfields[obj.name.toLowerCase().replace(/\s.*/, '')] = obj.id;
            });
        } catch (err) {
            console.error(`[!] Couldn't get custom fields from Trello:\n${err.message}`);
        }
        
    }

    async newCard(formFields, list = this.lists.incoming) {
        let query = [];
        query.push(`pos=bottom`);
        query.push(`idList=${list}`);
        const requestContent = JSON.stringify(formFields.request);
        const dataBody = {
            name: requestContent.length > 160 ? requestContent.substring(0,157) :  requestContent,
            desc: requestContent
        };

        const reqUri = `https://api.trello.com/1/cards${this.authParams}&${query.join('&')}`;
        try {
            const res = await axios.post(reqUri, dataBody);
            await this.storeRequest(formFields, res.data.id);
            this.addFields(res.data.id, formFields);
        } catch (err) {
            console.error(`Error while creating Trello card: ${err.message} (${reqUri})`);
            return err;
        }
    }

    async addFields(card, formFields) {
        delete formFields.request;
        const requests = [];
        Object.keys(formFields).forEach(item => {
            const field = this.cfields[item];
            const value = {
                "value": {
                    "text": formFields[item]
                },
                "key": config.key,
                "token": config.token
            };
            requests.push([`https://api.trello.com/1/card/${card}/customField/${field}/item`, value]);
        });
        requests.forEach(async req => {
            try {
                const res = await axios.put(req[0], req[1]);
            } catch (err) {
                console.error(`[!] Failed to update custom fields on card ${card}\n${err.message}`);
            }
        })

    }


    async storeRequest(request, trelloId) {
        return datastore.save({
            key: datastore.key('request'),
            data: {
                request: request,
                createdOn: new Date().toUTCString(),
                region: request.location,
                trelloId: trelloId
            }
        });
    }
}

module.exports = Trello;
