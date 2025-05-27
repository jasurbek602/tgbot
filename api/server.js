
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const audioRoutes = require('./routes/audio');
const cors = require('cors');

mongoose.connect('mongodb+srv://tred005t:Jasurbek008@cluster0.pts8wns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => console.log("MongoDB connected."));

app.use(cors());
app.use(express.json());
app.use('/api/audio', audioRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
