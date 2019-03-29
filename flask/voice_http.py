from flask import Flask, render_template, request, url_for, Response
from flask_cors import CORS
voice_app = Flask(__name__)
CORS(voice_app)

@voice_app.route('/voice')
def voice():
    def generate():
        with open("./today.wav", "rb") as fwav:
            data = fwav.read(1024)
            while data:
                yield data
                data = fwav.read(1024)
    return Response(generate(), mimetype="audio/wav")
	

if( __name__ == '__main__'):
	voice_app.run(debug=True)
