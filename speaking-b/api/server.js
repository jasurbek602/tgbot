require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const audioRoutes = require('./routes/audio');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected."));

app.use(cors());
app.use(express.json());
app.use('/api/audio', audioRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
