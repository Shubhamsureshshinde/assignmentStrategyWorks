const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/classrooms', require('./routes/classroom'));
app.use('/api/reports', require('./routes/report'));

app.get('/', (req, res) => res.send('API Running'));

module.exports = app;