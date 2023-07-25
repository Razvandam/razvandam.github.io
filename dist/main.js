let stream = null,
  audio = null,
  mixedStream = null,
  chunks = [],
  recorder = null,
  startButton = null,
  stopButton = null,
  downloadButton = null,
  recordedVideo = null;

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      // the await keyword is used in an async function to pause the execution of the function until the promise is resolved
      //getDisplayMedia() returns a Promise method prompts the user to select and grant permission to capture the contents of a display or portion thereof (such as a window) as a MediaStream
      video: true,
    });
    audio = await navigator.mediaDevices.getUserMedia({
      // .getUserMedia() method prompts the user for permission to use a media input which produces a MediaStream with tracks containing the requested types of media.
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100, // refers to the number of samples of audio carried per second 44,100 Hz  (samples per second)
      },
    });

    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}
function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".videoFeedback");
    video.srcObject = stream;
    video.play();
  } else {
    console.warn("No stream available");
  }
}

async function startRecording() {
  await setupStream();
  if (stream && audio) {
    mixedStream = new MediaStream([
      ...stream.getTracks(), //This line uses the spread operator to extract all the tracks (e.g., video tracks) from the stream MediaStream and includes them in the new array mixedStream.
      ...audio.getTracks(),
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable; //sets up an event handler for the dataavailable event of the MediaRecorder. When the dataavailable event occurs, the handleDataAvailable function will be called
    recorder.onstop = handleStop; //sets up an event handler for the stop event of the MediaRecorder. When the recording is stopped (either manually or automatically), the handleStop function will be called to perform tasks such as creating and handling the recorded media data (e.g., creating a downloadable file).
    recorder.start(); // starts the MediaRecorder, initiating the recording process. Once the recording starts, it will continue to capture media data until the stop() method is called on the MediaRecorder.
    startButton.disabled = true;
    stopButton.disabled = false;
    console.log("Recording started");
  } else {
    console.warn("No stream available.");
  }
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: "video/mp4" }); //This line of code creates a new Blob object named blob using the recorded media data stored in the chunks array.
  //A Blob (Binary Large Object) object is a data structure used to store binary data or large chunks of data, such as media files, images, or other binary data. The { type: "video/mp4" } specifies Multipurpose Internet Mail Extensions (MIME) of the media data.
  chunks = [];

  downloadButton.href = URL.createObjectURL(blob); // The Blob data is stored in the RAM (Random Access Memory) of your computer when it is created and processed by the browser
  // when you click the download button, the recorded video (which is stored in the Blob object in your RAM) is transferred or copied from your computer's RAM to your hard drive.
  // the browser URL is not directly used for downloading the recorded video to your hard drive. Instead, the URL.createObjectURL(blob) method is used to create a temporary URL that allows the Blob data to be referenced easily within the web page. This URL acts as a handle to the Blob data, allowing it to be used in various elements of the web page, such as video or audio tags, or for other purposes like displaying previews or generating download links.
  downloadButton.download = "video.mp4";
  downloadButton.disabled = false;

  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    const rc = document.querySelector(".recordedVideo");
    rc.classList.remove("hidden");
    rc.scrollIntoView({ behavior: "smooth", block: "start" }); //The Element interface's scrollIntoView() method scrolls the element's ancestor containers

    recordedVideo.play();
  };

  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log("Recording stopped");
}

function stopRecording() {
  recorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

window.addEventListener("load", () => {
  startButton = document.querySelector(".startRecording");
  stopButton = document.querySelector(".stopRecording");
  downloadButton = document.querySelector(".downloadVideo");

  recordedVideo = document.querySelector(".recordedVideo");

  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});
