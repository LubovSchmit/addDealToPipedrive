const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors'); // Добавьте этот импорт

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Включите CORS для всех маршрутов
app.use(cors({
    origin: 'https://add-deal-to-pipedrive.vercel.app' // Укажите свой домен
}));

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

        // Сохраняем access_token в файле
        fs.writeFileSync('token.json', JSON.stringify({ access_token }));

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
        address, city, state, zipCode, area, startDate, startTime, endTime, technicienSelect
    } = req.body;
    console.log('req.body:', req.body);
    // Загружаем access_token из сохраненного файла
    /*const accessToken = JSON.parse(fs.readFileSync('token.json')).access_token;*/

    try {
        const response = await axios.post('https://api.pipedrive.com/api/v2/deals', {
            "title": `HEY - Create a job`,
            "custom_fields": {
                "9efba3f71601acf1f5ced90841d6d2492cc5bf25": firstName,
                "b8b6f5989d438fd74f66e7216afa641b71d5ffd1": lastName,
                "e3ab7708be06309eaa6d1af79f8ac6cfa588556b": phone,
                "f7ef88ed767ea304de65fd21a2dbb3c8fa1865e8": email,
                "07c5a703564dbe41c74d1638bf3fe1c0b4a3efa2": parseInt(jobType, 10), //jobType
                "5aa52b3fd6d02886ea0db1c7cc168226767c5be6": parseInt(jobSource, 10), //jobSource
                "b1f08c6e1ba268caa3e876c668fdda165a446f53": jobDescription,
                "7c40d21a2c41b490f1ea4d242d30e19605c8866c": {
                    "value": address
                },
                "4d4817e6bcfd92b2a0f25dbc472024d17dff5f79": city,
                "1b2207c38bc60c36bf26558baa96051b6e583d6e": state,
                "8d7e483d0cdca37a5a13b47a9c0f5c6662f7d014": zipCode,
                "ce17207e0012a71e9999721c3a2aa789b4a3edf1": parseInt(area, 10),
                "70ce7ca885ecd9bcbd4e3bac2bda6e115db44c72": startDate,
                "085e49b353da671f146bcc38d77d4a42a532ed40": {
                    "value": `${startTime}:00`,
                    "until": `${endTime}:00`
                },
                "074490b581d4c19cc6c32a85e745a70cda21d409": parseInt(technicienSelect, 10)
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-token': 'd531b586ae2088eb5091f1bf03a5d82b6149df07',
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
