const express = require('express');
const { MongoClient, ObjectId} = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3001;
const dotenv = require('dotenv');
dotenv.config();
const mongoUrl = `${process.env.DB_URL}`;
const dbName = 'lanasupport';

app.use(bodyParser.json());
app.use(cors())
let db;

const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDB();


// Роут для создания заявки
app.post('/api/submitRequest', async (req, res) => {
    const { name, phone, contact, description, address } = req.body;

    const requestsCollection = db.collection('requests');

    try {
        await requestsCollection.insertOne({ name, phone,contact, description,address, status: false });
        res.status(201).json({ message: 'Заявка успешно создана' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Роут для получения всех заявок
app.get('/api/admin/requests', async (req, res) => {
    const requestsCollection = db.collection('requests');

    try {
        const requests = await requestsCollection.find().toArray();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/requests/:id', async (req, res) => {
    const requestId = req.params.id;

    const requestsCollection = db.collection('requests');

    try {
        await requestsCollection.updateOne({ _id: new ObjectId(requestId) }, { $set: { status: true } });
        res.status(200).json({ message: 'Статус заявки успешно изменен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
