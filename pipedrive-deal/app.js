require('dotenv').config();

const pipedrive = require('pipedrive');

async function addDeal() {
    try {
        console.log('Sending request...');

        // Создаем новый экземпляр клиента для каждого запроса
        const defaultClient = new pipedrive.ApiClient();
        defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

        const api = new pipedrive.DealsApi(defaultClient);

        const data = {
            title: 'Deal of the century',
            value: 10000, // Убедитесь, что это число, а не строка
            currency: 'USD',
            user_id: null, // Если не нужен, можно удалить или установить в нужное значение
            person_id: null, // Если не нужен, можно удалить или установить в нужное значение
            org_id: 1,
            stage_id: 1,
            status: 'open',
            expected_close_date: '2022-02-11', // Проверьте формат даты
            probability: 60,
            lost_reason: null, // Если не нужен, можно удалить или установить в нужное значение
            visible_to: 1,
            add_time: '2021-02-11' // Проверьте формат даты
        };

        const response = await api.addDeal(data);

        console.log('Deal was added successfully!', response);
    } catch (err) {
        console.error('Adding failed', err.response ? err.response.data : err.message);
    }
}

addDeal();
