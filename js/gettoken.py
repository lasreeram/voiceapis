# Request module must be installed.
# Run pip install requests if necessary.
import requests

subscription_key = 'fd2e5356e1524e94a76bc82cc6e69ffa'

def get_token(subscription_key):
    fetch_token_url = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken'
    headers = {
        'Ocp-Apim-Subscription-Key': subscription_key
    }
    response = requests.post(fetch_token_url, headers=headers)
    access_token = str(response.text)
    print(access_token)

get_token('fd2e5356e1524e94a76bc82cc6e69ffa')
