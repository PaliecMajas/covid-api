const axios = require('axios');
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

class Text2Reach {
    /**
     * @param config Expected object of config parameters:
     *  - API_KEY Application key
     */
    constructor(config) {
        this.config = config;
        this.fromName = 'PaliecMajas';
        this.endpoint = 'https://api.text2reach.com/sms/send';
    }


    async sendMessage(phoneNumber, messageText) {
        if ( ! phoneNumber.match(/^(371)?(\d{8})$/)) {
            // Work only with LV phone numbers
            return;
        }
        const msisdn = phoneNumber.length === 11
            ? phoneNumber
            : `371${phoneNumber}`;
        const queryParams = [
            `api_key=${this.config['API_KEY']}`,
            `phone=${msisdn}`,
            `from=${this.fromName}`,
            `message=${messageText}`
        ];
        const uri = `${this.endpoint}?${queryParams.join('&')}`;
        // 0   - HTTP related error
        // < 0 - Business error
        // > 0 - Success, message ID
        let responseCode = '0';
        try {
            const response = await axios.get(uri);
            responseCode = parseInt(response.data);
            if (responseCode < 0) {
                console.error(`[E] Error while sending SMS via ${this.endpoint} to ${msisdn}. Response code: ${responseCode}`);
            }
        } catch (err) {
            console.error(`[E] Error while sending SMS via ${this.endpoint} to ${msisdn}: ${err.message}`);
        } finally {
            this.storeSms(msisdn, messageText, responseCode);
        }
    }

    async storeSms(msisdn, messageText, result) {
        const dataObject = {
            key: datastore.key('sms'),
            data: {
                createdOn: new Date().toUTCString(),
                msisdn: msisdn,
                messageText: messageText,
                result: result
            }
        };
        return datastore.save(dataObject, (err) => {
            if (err) {
                console.error(`[E] Error while storing SMS ${JSON.stringify(dataObject)} in data store: ${err.message}`);
            }
        });
    }
}

module.exports = Text2Reach;
