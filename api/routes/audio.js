const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleAudioUpload } = require('../controllers/audioController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('audio'), handleAudioUpload);

module.exports = router;
