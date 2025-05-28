const API_URL = 'https://tgbot-production-ca44.up.railway.app/upload';
let mediaRecorder, audioChunks = [];

document.getElementById('startBtn').onclick = async () => {
  document.getElementById('result').innerText = '';
  await startTimer('Prepare...', 5);
  await recordAudio(30);
};

function startTimer(label, seconds) {
  return new Promise(resolve => {
    const timerDiv = document.getElementById('timer');
    let count = seconds;
    timerDiv.innerText = `${label} ${count}s`;
    const interval = setInterval(() => {
      count--;
      timerDiv.innerText = `${label} ${count}s`;
      if (count <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

async function recordAudio(seconds) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();

  await startTimer('Recording...', seconds);

  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, 'speech.webm');

    const res = await fetch(API_URL, {
      method: 'POST',
      body: form
    });

    const data = await res.json();
    document.getElementById('result').innerText = `📄 Transcript:
${data.transcript}

📝 Feedback:
${data.feedback}`;
  };
}
