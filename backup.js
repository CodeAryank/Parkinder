// Select necessary DOM elements
const micBtn = document.querySelector('#mic');
const playback = document.querySelector('.playback');
const generate = document.querySelector('#generate');
const instructions = document.querySelector('.instructions');
const elapsedTimeDisplay = document.getElementById('timer');

// Initialize recording state variables
let canRecord = false;
let isRecording = false;
let recorder = null;
let chunks = [];
let startTime;
let timerInterval;
let mp3Encoder = null; // Store the MP3 encoder
let mp3Data = []; // Store the MP3 data
let audioURL = ''; // Store the audio URL for downloading

// Add event listener to the microphone button
micBtn?.addEventListener('click', toggleMic);

// Set up audio when the script loads
setupAudio();

/**
 * Set up audio recording by requesting user permission to access the microphone.
 */
function setupAudio() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(setupStream)
      .catch(handleError);
  } else {
    console.error('getUserMedia not supported on your browser!');
  }
}

/**
 * Initialize the media recorder with the audio stream.
 * @param {MediaStream} stream - The audio stream from the user's microphone.
 */
function setupStream(stream) {
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = handleDataAvailable;
  recorder.onstop = handleStop;

  canRecord = true;
}


/**
 * Handle the availability of audio data chunks.
 * @param {Event} event - The data available event.
 */
function handleDataAvailable(event) {
  chunks.push(event.data);
}

/**
 * Handle the stop event of the media recorder, creating a playable audio blob and setting up the download link.
 */
function handleStop() {
  const audioBlob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
  const audioFileReader = new FileReader();

  audioFileReader.onload = function() {
    const arrayBuffer = audioFileReader.result;
    const audioData = new Int16Array(arrayBuffer);

    // Ensure that the byte length is a multiple of 2
    const trimmedData = audioData.subarray(0, audioData.length - (audioData.length % 2));

    encodeToMP3(trimmedData);
  };

  audioFileReader.readAsArrayBuffer(audioBlob);

  playback.src = audioURL;

  playback.classList.remove('is-hidden');
  generate.classList.remove('is-hidden');
}

/**
 * Handle errors during the setup of the audio stream.
 * @param {Error} error - The error object.
 */
function handleError(error) {
  console.error('Error accessing audio stream:', error);
}

/**
 * Toggle the microphone recording state.
 */
function toggleMic() {
  if (!canRecord) return;

  isRecording = !isRecording;
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

/**
 * Start recording audio and update the UI accordingly.
 */
function startRecording() {
  startTime = Date.now();
  recorder.start();
  micBtn.classList.add('is-recording');
  instructions.classList.add('is-hidden');
  timerInterval = setInterval(updateElapsedTime, 1000);
}

/**
 * Stop recording audio and update the UI accordingly.
 */
function stopRecording() {
  recorder.stop();
  micBtn.classList.remove('is-recording');
  instructions.classList.add('is-hidden');
  clearInterval(timerInterval);
}

/**
 * Update the elapsed recording time display.
 */
function updateElapsedTime() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  elapsedTimeDisplay.textContent = formattedTime;
}

/**
 * Encode audio data to MP3 format.
 * @param {Int8Array} audioData - The audio data to encode.
 */
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

// Add an event listener to the generate button to download the audio file
generate.addEventListener('click', () => {
  if (audioURL) {
    // Create a temporary anchor element
    const downloadLink = document.createElement('a');
    downloadLink.href = audioURL;
    downloadLink.download = 'recording.mp3'; // You can customize the file name
    document.body.appendChild(downloadLink);

    // Programmatically click the link to trigger the download
    downloadLink.click();

    // Clean up: remove the temporary anchor element from the DOM
    document.body.removeChild(downloadLink);

    // window.location.href="resultsPage/results.html";
  }
});
