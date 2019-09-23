//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

$('#exampleModalCenter').on('hidden.bs.modal', function (e) {
    stopRecording();
})
var recordButton = document.getElementById("recordButton");


//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);

document.getElementById("exampleModalCenter").onmouseup = function () {
    stopRecording();
};
document.getElementById("speech").onmouseup = function () {
    stopRecording();
};

function startRecording() {
    /*
        Simple constraints object, for more advanced features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    var constraints = {audio: true, video: false}

    /*
    	We're using the standard promise based getUserMedia()
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device

        */
        audioContext = new AudioContext();

        //assign to gumStream for later use
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        //stop the input from playing back through the speakers
        //input.connect(audioContext.destination)

        //get the encoding
        encodingType = "ogg";


        recorder = new WebAudioRecorder(input, {
            workerDir: "./search/js/", // must end with slash
            encoding: encodingType,
            numChannels: 2, //2 is the default, mp3 encoding supports only 2
            onEncoderLoading: function (recorder, encoding) {
                // show "loading encoder..." display
                $('#exampleModalCenter').modal('show');
            },
            onEncoderLoaded: function (recorder, encoding) {
                // hide "loading encoder..." display
            }
        });

        recorder.onComplete = function (recorder, blob) {
            createDownloadLink(blob, recorder.encoding);
        }

        recorder.setOptions({
            timeLimit: 20,
            encodeAfterRecord: encodeAfterRecord,
            ogg: {quality: 0.5},
            mp3: {bitRate: 160}
        });

        //start the recording process
        recorder.startRecording();

    }).catch(function (err) {
        //enable the record button if getUSerMedia() fails


    });

    //disable the record button

}

function stopRecording() {
    document.getElementById("loading").style.display = 'block';
    $('#exampleModalCenter').modal('hide');
    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //disable the stop button


    //tell the recorder to finish the recording (stop recording + encode the recorded audio)
    recorder.finishRecording();

}

function createDownloadLink(blob, encoding) {
    $('#exampleModalCenter').modal('hide');
    var reader = new FileReader();
    reader.readAsDataURL(blob)
    reader.onloadend = function () {
        var base64data = reader.result;


        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        var param = "action="+String(base64data.slice(base64data.indexOf(',') + 1));
        //var param = base64data;

        //console.log(param);
        xhr.open("POST", "../speech.php");
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(param);

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                document.getElementById("loading").style.display = 'none';
                if(JSON.parse(this.responseText)['answer']['result']){
                    document.getElementById("search").value=JSON.parse(this.responseText)['answer']['result'];

                }else{
                    alert('Голос не распознан');
                }

            }
        });
    }
}
