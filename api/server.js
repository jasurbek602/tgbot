const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const app = express();

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/audio/upload', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;
  const task = req.body.task || 'task1';

  try {
    const audio = fs.createReadStream(filePath);
    const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', audio, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'multipart/form-data'
      },
      params: {
        model: 'whisper-1'
      }
    });

    const transcript = whisperRes.data.text;

    const criteria = {
      task1: `• Grammar: Simple grammar with some errors.\n• Vocabulary: Sufficient for topic.\n• Pronunciation: Some strain.\n• Fluency: Pausing and reformulation.`,
      task2: `• Grammar: Mostly correct simple structures.\n• Vocabulary: Adequate.\n• Pronunciation: Intelligible.\n• Fluency: Some false starts.\n• Cohesion: Basic connectors.`
    };

    const prompt = `Student's answer: "${transcript}"\nEvaluate it for ${task.toUpperCase()} using:\n${criteria[task]}\nGive score (0–5) and short feedback.`;

    const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a speaking test evaluator.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      }
    });

    const evaluation = gptRes.data.choices[0].message.content;
    res.json({ transcription: transcript, evaluation });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Baholashda xatolik' });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
