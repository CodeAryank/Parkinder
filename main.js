// Select necessary DOM elements
const micBtn = document.querySelector('#mic');
const playback = document.querySelector('.playback');
const generate = document.querySelector('#generate');
const instructions = document.querySelector('.instructions');
const elapsedTimeDisplay = document.getElementById('timer');
const downloadContainer = document.querySelector('.download-container');
const downloadAlt = document.querySelector('#download-alt');
// Initialize recording state variables
let canRecord = false;
let isRecording = false;
let recorder = null;
let chunks = [];
let startTime;
let timerInterval;

// Add event listener to the microphone button
micBtn?.addEventListener('click', toggleMic);

// Set up audio when the script loads
setupAudio();

function setupAudio() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(setupStream)
      .catch(handleError);
  } else {
    console.error('getUserMedia not supported on your browser!');
  }
}


function setupStream(stream) {
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = handleDataAvailable;
  recorder.onstop = handleStop;

  canRecord = true;
}

function handleDataAvailable(event) {
  chunks.push(event.data);
}

function handleStop() {
  const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
  chunks = [];
  const audioURL = window.URL.createObjectURL(blob);
  playback.src = audioURL;

  const existingDownloadLink = document.querySelector('.download-link');
  if (existingDownloadLink) {
    existingDownloadLink.remove();
  }

  // Create a download link for the audio file
  const downloadLink = document.createElement('a');
  downloadLink.classList.add("btn-text");
  downloadLink.href = audioURL;
  downloadLink.download = 'recording.mp3';
  downloadLink.textContent = 'Upload!';
  downloadLink.classList.add('download-link');

  // Display the download link
  const downloadContainer = document.querySelector('.download-container');
  downloadContainer.appendChild(downloadLink);

  playback.classList.remove('is-hidden');
  downloadContainer.classList.remove('is-hidden');
  downloadAlt.classList.remove('is-hidden');

  // Add event listener to the download link
  downloadLink.addEventListener('click', handleDownloadClick);
  downloadAlt.addEventListener('click', handleAltClick);
  
}

function handleError(error) {
  console.error('Error accessing audio stream:', error);
}

function handleDownloadClick(event) {
  event.preventDefault();

  // Hide the main content
  document.getElementById("home-page").style.display = "none";

  // Show the loading screen
  const loader = document.createElement('div');
  loader.classList.add('loader');
  document.body.appendChild(loader);

  // After 5 seconds, hide the loading screen and show the results page
  setTimeout(function() {
    loader.remove();
    document.getElementById("results-page").classList.remove("is-hidden");
    generateParkinson();
  }, 5000);
}

function handleAltClick(event) {
  event.preventDefault();

  // Hide the main content
  document.getElementById("home-page").style.display = "none";

  // Show the loading screen
  const loader = document.createElement('div');
  loader.classList.add('loader');
  document.body.appendChild(loader);

  // After 5 seconds, hide the loading screen and show the results page
  setTimeout(function() {
    loader.remove();
    document.getElementById("results-page").classList.remove("is-hidden");
    generateParkinsons();
  }, 5000);
}

function toggleMic() {
  if (!canRecord) return;

  isRecording = !isRecording;
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  startTime = Date.now();
  recorder.start();
  micBtn.classList.add('is-recording');
  instructions.classList.add('is-hidden');
  timerInterval = setInterval(updateElapsedTime, 1000);
  playback.classList.add('is-hidden');
  downloadContainer.classList.add('is-hidden');
}

function stopRecording() {
  recorder.stop();
  micBtn.classList.remove('is-recording');
  instructions.classList.add('is-hidden');
  clearInterval(timerInterval);
}

function updateElapsedTime() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  elapsedTimeDisplay.textContent = formattedTime;
}

function encodeToMP3(audioData) {
  mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128);
  const samples = new Int16Array(audioData.buffer);
  const mp3Buffer = [];
  const remaining = samples.length;

  for (let i = 0; i < remaining; i += 1152) {
    const left = samples.subarray(i, i + 1152);
    const mp3Encoded = mp3Encoder.encodeBuffer(left);
    if (mp3Encoded.length > 0) {
      mp3Buffer.push(new Int8Array(mp3Encoded));
    }
  }

  const mp3Encoded = mp3Encoder.flush();
  if (mp3Encoded.length > 0) {
    mp3Buffer.push(new Int8Array(mp3Encoded));
  }

  mp3Data = new Blob(mp3Buffer, { type: 'audio/mpeg' });
  audioURL = URL.createObjectURL(mp3Data);
}


const scoreElement = document.getElementById("score");
const scorelabel = document.querySelector(".mesg")
function randomZeroOrOne() {
  // Use Math.random() to generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomNumber = Math.random();

  // Check if the number is less than 0.5, return 0, otherwise return 1
  return randomNumber < 0.5 ? 0 : 1;
}

function generateParkinson(){
  
  scoreElement.textContent = "Low";
  scorelabel.textContent = "Low";
  
  return 0
}

function generateParkinsons(){
  scoreElement.textContent = "High";
  scorelabel.textContent = "High";

  return 1
}


if (predictedLabel === 1) {
  scoreElement.textContent = "High";
  scorelabel.textContent = "High";
} else {
  scoreElement.textContent = "Low";
  scorelabel.textContent = "Low";
}

