// server.js
const express = require('express');
const cors = require('cors');
const documentsRouter = require('./routes/documents');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/documents', documentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
