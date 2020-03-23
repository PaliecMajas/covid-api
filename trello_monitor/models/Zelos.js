const axios = require('axios');

const config = {
    "credentials": {
        "email": process.env.CRED_ZELOS_EMAIL,
        "password": process.env.CRED_ZELOS_PASSWORD
    },
    "workspace": process.env.ZELOS_WORKSPACE
};

class Zelos {
    constructor() {
        this.url = `https://${config.workspace}.zelos.space`;
        this.credentials = config.credentials;
    }
    async init() {
        try {
            const res = await axios.post('https://app.zelos.space/api/auth', this.credentials);
            this.tokens = res.data.data;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.tokens.access.token}`;
            const status = await axios.get(`${this.url}/api/status`);
            console.log(`[i] Authenticated to "${status.data.event_name}"`);
        } catch (e) {
            console.error(`Error while authenticate to Zelos: ${e.message}`);
        }
    }
    async getTasks() {
        const res = await axios.get(`${this.url}/api/task`);
        this.tasks = res.data.data;
        console.log(`[i] Found ${this.tasks.length} tasks`)
    }
    async getGroups(name = "") {
        const res = await axios.get(`${this.url}/api/group`);
        this.groups = res.data.data;
        console.log(`[i] Loaded ${this.groups.length} groups`);
    }

    async findGroup(name) {
        let url = `${this.url}/api/group?name=${name}`;
        url = encodeURI(url);
        const res = await axios.get(url);
        if (res.data.data === "") {
            return "";
        }
        const group = res.data.data;
        if (group.length === 0) {
            console.error(`[E] Cannot find group "${name}"`);
        }

        return group[0].data.id;
    }

    async newTask(details, groups = []) {
        let name = "";
        const description = details.description;
        if (description.length > 255) {
            name = `${description.substring(0,252)}...`
        } else {
            name = description
        }
        const instruction = [];
        Object.keys(details).forEach(item => {
            if (item === 'phone' || item === 'address' || item === 'name' || item === 'neighborhood') {
                instruction.push(`${item.capitalize()}: ${details[item]}`);
            }
        });
        const body = {
            "type": "regular",
            "name": `${name}`,
            "description": `${description}`,
            "instructions": `${instruction.join('\n')}`,
            "execution_start_date": null,
            "execution_end_date": null,
            "points": 1,
            "publish_at": null,
            "active_until": null,
            "images": [],
            "assignment_approve_needed": true,
            "completion_approve_needed": false,
            "max_participants_amount": 1,
            "groups": groups,
            "location_id": null,
            "user_ids": []
        };
        try {
            const res = await axios.post(`${this.url}/api/task/regular`, body);
            const taskUrl = this.url + "/tasks/" + res.data.data.id;
            console.log(`[D] Created ${taskUrl}`);
            return taskUrl;
        } catch (err) {
            console.error(`[E] Failed to create task: ${err.message}`);
            return err;
        }
        
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function getKeyByValue(object, value) { 
    return Object.keys(object).find(key => object[key] === value); 
}

module.exports = Zelos;
