require('dotenv').config();
const pipedrive = require('pipedrive');
const defaultClient = new pipedrive.ApiClient();
const PIPEDRIVE_API_KEY = process.env.PIPEDRIVE_API_KEY;
defaultClient.authentications.api_key.apiKey = PIPEDRIVE_API_KEY;

async function addDeal() {
    try {
        console.log('Sending request...');

        const api = new pipedrive.DealsApi(defaultClient);

        const data = {
            title: 'Deal of the century',
            value: 10000,
            currency: 'USD',
            user_id: null, // Убедитесь, что этот параметр соответствует требованиям вашего аккаунта Pipedrive
            person_id: null, // Убедитесь, что этот параметр соответствует требованиям вашего аккаунта Pipedrive
            org_id: 1,
            stage_id: 1,
            status: 'open',
            expected_close_date: '2022-02-11',
            probability: 60,
            lost_reason: null,
            visible_to: 1,
            add_time: '2021-02-11',
        };
        const response = await api.addDeal(data);

        console.log('Deal was added successfully!', response.data);
    } catch (err) {
        console.error('Adding failed', err.response ? err.response.data : err.message);
    }
}

addDeal();
