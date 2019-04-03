//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording
var blob2;

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

var token_value;
var lock_voice = false;
var streamInit = false;

window.onload = init;
var context;    // Audio context
var buf;        // Audio buffer


window.onload = init;
var context;    // Audio context
var buf;        // Audio buffer

function init() {
console.log( "init called" );
if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
        alert("Your browser does not support any AudioContext and cannot play back this audio.");
        return;
    }
        window.AudioContext = window.webkitAudioContext;
    }

    context = new AudioContext();
}

function playByteArray(byteArray) {
	console.log( "play byte array");

    var arrayBuffer = new ArrayBuffer(byteArray.length);
    var bufferView = new Uint8Array(arrayBuffer);
    for (i = 0; i < byteArray.length; i++) {
      bufferView[i] = byteArray[i];
    }

    context.decodeAudioData(arrayBuffer, function(buffer) {
        buf = buffer;
        play();
    });
}

// Play the loaded file
function play() {
    // Create a source node from the buffer
    var source = context.createBufferSource();
    source.buffer = buf;
    // Connect to the final output node (the speakers)
    source.connect(context.destination);
    // Play immediately
    source.start(0);
}


function startRecording() {

	createAuthToken();

	console.log("recordButton clicked");
	console.log("recordButton clicked again");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
	var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
	//	if( streamInit == false ){
			audioContext = new AudioContext();

			//update the format 
			document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

			/*  assign to gumStream for later use  */
			gumStream = stream;
		
			/* use the stream */
			input = audioContext.createMediaStreamSource(stream);
	//	}else{
			streamInit = true;
	//	}

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");
		console.log( "recording new" );

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked");
	console.log("stop button clicked - new" );

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause"; 
	//tell the recorder to stop the recording
	rec.stop();

	//comment this out for now
	//stop microphone access
	//gumStream.getAudioTracks()[0].stop();

	
	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createAuthToken(){
	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4) {
			console.log("Server returned: ",e.target.responseText);
			token_value = e.target.responseText;
		}
	};
	//xhr.open("POST","https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken",true);
	xhr.open("POST","https://canadacentral.api.cognitive.microsoft.com/sts/v1.0/issuetoken", true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded' );
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', '10a47ec1ca214143811429e5ac54f243' );
	xhr.send();
}

function callAzureVoiceApi(blob){
	console.log("call azure api ")
	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4) {
			console.log("Server returned: ",e.target.responseText);
		}
	};

	var output_format="simple";
	var language="en-US";
	var locale="en-US";

	//var request_url="https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?";
	var request_url="https://canadacentral.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1";
	console.log( request_url );
	console.log( "token = " + token_value );
	xhr.open("POST", request_url, true);
	xhr.setRequestHeader('Authorization', 'Bearer ' + token_value );
	xhr.setRequestHeader('language', 'en-US' );
	xhr.setRequestHeader('Content-type', 'audio/wav; codec=\"audio/pcm\"; samplerate=16000' );
	xhr.send(blob);
}

function doneVoice(){
	console.log( "done!");
}

function callServer(blob){
        console.log("call server!");
        console.log(blob);
	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4) {
			console.log( "on load of voice api called " + this.readyState + "," + this.status  );
			if( this.status == 200 ){
				//playByteArray(this.response);
				var blob = new Blob([xhr.response], {type: "audio/wav"});
				var url = URL.createObjectURL(blob);
				var au = document.createElement('audio');
				au.src = url;
				au.onload = function(evt){
					URL.revokeObjectURL(url);
				}
				au.play();
				
				/*
				console.log("flask server returned: ",this.status);
				console.log("flask server returned: ",this.response );
				
				var wavString = this.response;
				var len = wavString.length;
				var buf = new ArrayBuffer(len);
				var view = new Uint8Array(buf);
				for (var i = 0; i < len; i++) {
  					view[i] = wavString.charCodeAt(i) & 0xff;
				}
				var blob = new Blob([view], {type: "audio/wav"});
				//var blob = new Blob([view], {type: "audio/x-wav"});
				//var blob = new Blob([view], { 'type' : 'audio/wav; codecs=MS_PCM' } );
				//playAudio(blob, doneVoice);
				*/
			}
		}
	};

	var request_url = "http://13.88.224.49:5000/voice";
	console.log( "calling post on " + request_url );
	xhr.open("POST", request_url, true);
	xhr.setRequestHeader('Content-type', 'audio/wav; codec=\"audio/pcm\"; samplerate=16000' );
	xhr.responseType = 'blob';
	xhr.send(blob);
}

function playMP3(blob, endhandler) {
	console.log( "play audio" );
	var au = document.createElement('audio');
	au.type = AudioType;
	var url = URL.createObjectURL(blob);
	au.src = url;
	au.addEventListener( 'ended', endhandler );
	au.play();
}

function playAudio(blob, endhandler) {
	console.log( "play audio" );
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	au.src = url;
	au.addEventListener( 'ended', endhandler );
	au.play();
}

function buildDialog(blob) {
	console.log( "build dialog" );
	playAudio(blob);
}

function recordAndSendUserVoice(){
	console.log( "record and send user voice" );
	startRecording();
	//stopRecording must take microphone blob, make Http call get http response with voice, and call playServerVoice again with dialogStart as false
	setTimeout( stopRecording, 10000 ); 
}

function convertmp3ToBlob(mp3data){
	
}

function convertWAVToBlob(wavString){
	var len = wavString.length;
	var buf = new ArrayBuffer(len);
	var view = new Uint8Array(buf);
	for (var i = 0; i < len; i++) {
		view[i] = wavString.charCodeAt(i) & 0xff;
	}
	var blob = new Blob([view], {type: "audio/x-wav"});

	return blob;
}

function playServerVoice(dialogStart){
	console.log( "play server voice " );
	//if lock is not available return true 
	//http call with dialogStart=true/false value in request header
	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4) {
			console.log( "on load of voice api called " + this.readyState + "," + this.status  );
			if( this.status == 200 ){
				console.log("flask server returned: ",this.status);
				console.log("flask server returned: ",this.response );
				
				//playMP3( this.response, doneVoice );
				
				var wavString = this.response;
				var len = wavString.length;
				var buf = new ArrayBuffer(len);
				var view = new Uint8Array(buf);
				for (var i = 0; i < len; i++) {
  					view[i] = wavString.charCodeAt(i) & 0xff;
				}
				var blob = new Blob([view], {type: "audio/x-wav"});
				playAudio(blob, recordAndSendUserVoice);
			
			}
		}
	};
	var request_url = "http://13.88.224.49:5000/voice";
	console.log( request_url );
	xhr.open("GET", request_url, true);
	//xhr.setRequestHeader('Content-type', 'text/plain' );
	xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
	//xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	xhr.send();
	//if response not 200 - return true
	//get audio from message
	//call playAudio with end event handler recordAndSendUserVoice
}

function startDialog(){
	console.log( "start dialog" );
	playServerVoice(true);
}

function createDownloadLink(blob) {

	console.log( "create download link" );
	callServer(blob);
	//playAudio(blob);
	console.log(blob);
	return;
	//playAudio( blob, startDialog );
	//return;
	console.log( "create download link called" );
	//createAuthToken();
	//callAzureVoiceApi(blob);
	//playWave(blob);
	//buildDialog(blob);
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
	au.addEventListener( 'ended', (event) => {
		console.log ( "play back ended!" );
	} );
	au.play();

	//save to disk link
	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);
	
	//add the filename to the li
	li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	li.appendChild(link);
	
	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.innerHTML = "Upload";
	upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}
