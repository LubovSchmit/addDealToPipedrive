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

        // Данные для создания сделки
        const data = {
            title: 'Deal of the century',
            value: '10000', // Значение должно быть строкой
            currency: 'USD',
            user_id: null, // Использовать пользователя, делающего запрос
            person_id: null, // Не указан, нужно либо указать person_id, либо org_id
            org_id: 1,
            stage_id: 1, // Убедитесь, что этот stage_id корректен
            status: 'open',
            expected_close_date: '2024-12-31', // Пример даты в формате YYYY-MM-DD
            probability: 60,
            lost_reason: null,
            visible_to: '3' // Пример значения, зависящего от видимости
        };

        const response = await api.addDeal(data);

        console.log('Deal was added successfully!', response.data);
    } catch (err) {
        console.error('Adding failed', err.response ? err.response.data : err.message);
        console.error('Full error:', err);
    }
}

addDeal();
