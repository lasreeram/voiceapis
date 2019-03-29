from flask import Flask, render_template, request, url_for
from flask_cors  import CORS
voice_app = Flask(__name__)
CORS(voice_app)

@voice_app.route('/voice')
def voice():
    path_to_file = "/today.wav"

    return send_file(
         path_to_file, 
         mimetype="audio/wav", 
         as_attachment=True, 
         attachment_filename="today.wav")

if( __name__ == '__main__'):
	voice_app.run(debug=True, ssl_context='adhoc')
