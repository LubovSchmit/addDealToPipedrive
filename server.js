const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const path = require('path'); // Добавлено для работы с путями
require('dotenv').config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Указываем путь к папке с HTML файлами
app.use(express.static(path.join(__dirname, 'pipedrive-deal')));

// Обслуживаем index.html по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pipedrive-deal', 'index.html'));
});

// Обслуживаем form.html для iframe
app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pipedrive-deal', 'form.html'));
});

// Путь для авторизации и перенаправления
app.get('/authorize', (req, res) => {
    const clientId = process.env.PIPEDRIVE_CLIENT_ID;
    const redirectUri = encodeURIComponent('http://localhost:3001/callback');
    const authUrl = `https://oauth.pipedrive.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
});

// Обратный вызов после успешной авторизации
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const clientId = process.env.PIPEDRIVE_CLIENT_ID;
    const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3001/callback';

    console.log('Authorization code:', code);

    try {
        const response = await axios.post('https://oauth.pipedrive.com/token', querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = response.data;

        // Выводим access_token для проверки
        console.log('Access token:', access_token);

        // Сохраните access_token для последующего использования, например, в переменной окружения или базе данных
        process.env.PIPEDRIVE_ACCESS_TOKEN = access_token;

        res.send('Authorization successful! You can now use the app.');
    } catch (error) {
        console.error('Error during callback:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to authorize');
    }
});

// Создание сделки в Pipedrive
app.post('/api/create-deal', async (req, res) => {
    const {
        firstName, lastName, phone, email, jobType, jobSource, jobDescription,
        address, city, state, zipCode, area, startDate, startTime, endTime, testSelect
    } = req.body;

    const accessToken = process.env.PIPEDRIVE_ACCESS_TOKEN;

    try {
        const response = await axios.post('https://api.pipedrive.com/v2/deals', {
            title: `NEW - Create a job`,
            custom_fields: {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email,
                job_type: jobType,
                job_source: jobSource,
                job_description: jobDescription,
                address: address,
                city: city,
                state: state,
                zip_code: zipCode,
                area: area,
                start_date: startDate,
                start_time: startTime,
                end_time: endTime,
                test_select: testSelect
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating deal:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create deal' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
