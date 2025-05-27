const axios = require('axios');
const fs = require('fs');

const criteriaMap = {
  task1: `• Grammar: Simple grammar with some errors.
• Vocabulary: Sufficient for topic.
• Pronunciation: Some strain.
• Fluency: Pausing and reformulation.`,
  task2: `• Grammar: Mostly correct simple structures.
• Vocabulary: Adequate.
• Pronunciation: Intelligible.
• Fluency: Some false starts.
• Cohesion: Basic connectors.`,
  task3: `• Grammar: Some complex structures.
• Vocabulary: Covers topic well.
• Pronunciation: Clear.
• Fluency: Minor hesitation.`,
  task4: `• Grammar: Complex, few errors.
• Vocabulary: Wide range.
• Pronunciation: Clear.
• Fluency: Smooth and connected speech.`
};

async function whisperTranscribe(filePath) {
  const audio = fs.createReadStream(filePath);
  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', audio, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'multipart/form-data'
    },
    params: {
      model: 'whisper-1'
    }
  });
  return response.data.text;
}

async function evaluateSpeaking(taskKey, text) {
  const criterion = criteriaMap[taskKey];
  const prompt = `Student answer: "${text}"\nEvaluate this for ${taskKey.toUpperCase()} using:\n${criterion}\nGive score (0–5/6) + short feedback.`;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a speaking test evaluator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${'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'}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}

module.exports = { whisperTranscribe, evaluateSpeaking };
