const { whisperTranscribe, evaluateSpeaking } = require('../utils/openai');

const handleAudioUpload = async (req, res) => {
  const task = req.body.task;
  const filePath = req.file.path;

  try {
    const text = await whisperTranscribe(filePath);
    const evaluation = await evaluateSpeaking(task, text);
    res.json({ transcription: text, evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Evaluation failed' });
  }
};

module.exports = { handleAudioUpload };
