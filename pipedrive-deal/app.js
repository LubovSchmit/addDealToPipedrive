require('dotenv').config();
const pipedrive = require('pipedrive');
const defaultClient = new pipedrive.ApiClient();
const PIPEDRIVE_API_KEY = process.env.PIPEDRIVE_API_KEY;

// Настройка авторизации
defaultClient.authentications.api_key.apiKey = PIPEDRIVE_API_KEY;

async function addDeal() {
    try {
        console.log('Sending request...');

        const api = new pipedrive.DealsApi(defaultClient);

        const data = {
            title: 'Deal of the century',
        };

        const response = await api.addDeal(data);

        console.log('Deal was added successfully!', response.data);
    } catch (err) {
        console.error('Adding failed', err.response ? err.response.data : err.message);
        console.error('Full error:', err);
    }
}

addDeal();
