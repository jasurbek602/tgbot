let mediaRecorder;
let audioChunks = [];

document.getElementById('start').onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
};

document.getElementById('stop').onclick = async () => {
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'speech.webm');
    formData.append('task', 'task1');

    const res = await fetch('http://', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    alert(`Matn: ${data.transcription}\n\nBaholash: ${data.evaluation}`);
  };
};
