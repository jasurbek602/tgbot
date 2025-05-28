const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const audio = fs.createReadStream(filePath);
    const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', audio, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'multipart/form-data'
      },
      params: { model: 'whisper-1' }
    });

    const transcript = whisperRes.data.text;

    const criteria = `Evaluate the following speaking answer based on these criteria for Questions 1-3:
• Grammar: Some simple grammatical structures are used correctly but basic mistakes systematically occur.
• Vocabulary: Sufficient to respond to the questions, although inappropriate word choices are noticeable.
• Pronunciation: Mispronunciations are noticeable and frequently place a strain on the listener.
• Fluency: Frequent pausing, false starts, and reformulations, but meaning is still clear.
Score from 0 to 5 and give brief feedback.`;

    const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a speaking test evaluator.' },
        { role: 'user', content: `Transcript: "${transcript}"

${criteria}` }
      ]
    }, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      }
    });

    const feedback = gptRes.data.choices[0].message.content.trim();
    res.json({ transcript, feedback });
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Evaluation failed' });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
