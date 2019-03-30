from flask import Flask, render_template, request, url_for, Response
from flask_cors import CORS
import requests
voice_app = Flask(__name__)
CORS(voice_app)



def get_token(subscription_key):
    print( "get token for subscription key = ", subscription_key )
    fetch_token_url = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken'
    #fetch_token_url = "https://westus.api.cognitive.microsoft.com/sts/v1.0"
    headers = {
        'Ocp-Apim-Subscription-Key': subscription_key,
	'Content-type': 'application/x-www-form-urlencoded'
    }
    print( "posting request" )
    try:
        response = requests.post(fetch_token_url, headers=headers)
    except requests.exceptions.HTTPError as err:
        print (err)
    print ( "response received ", response.text )
    access_token = str(response.text)
    print(access_token)
    return access_token

def call_azure_speech_to_text(voice_data):
    subscription_key = 'ecb18d63763c4d0bb4a7b6bffe5ab85c'
    subscription_key2 = '0982703cb8ac472e90fba1b37648eda2'
    azure_token = get_token(subscription_key)
    url = "https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?"
    headers = {
        'Authorization': 'Bearer ' + azure_token,
        'Content-type': 'audio/wav; codec=\"audio/pcm\"; samplerate=16000',
	'Content-length': 0
    }
    print( "posting request to azure stt api" )
    #print( str(voice_data) )
    response = requests.post( url, data=voice_data, headers=headers )
    if( response.status_code != requests.codes.ok ):
        print( "response status = ", response.status_code )
        #raise response.status_code
    return response.text
    

@voice_app.route('/voice', methods = ['POST'] )
def voice():
    #try:
    #print( len(request.data) )
    response_text = call_azure_speech_to_text(request.data )
    #except :
    #    response = Response(status=500)
    #    return response
    print response_text
    response = Response(status=200)
    return response

if( __name__ == '__main__'):
	voice_app.run(debug=True)
