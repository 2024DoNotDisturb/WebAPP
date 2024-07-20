from flask import jsonify, request, Blueprint
import requests
from config import Config

smarthome = Blueprint('smarthome', __name__)

@smarthome.route('/command', methods=['POST'])
def send_command():
    cmd = request.args.get('cmd')
    if not cmd:
        print('sned_command')
        return jsonify({'error': 'No command provided'})

    try:
        print(f'{Config.ESP8266_IP}/command?cmd={cmd}')
        response = requests.get(f'{Config.ESP8266_IP}/command?cmd={cmd}')
        
        response_text = response.text.strip()
        if cmd in ['C_Kit_HT', 'C_Toi_HT']:
            temperature, humidity = response_text.split(',')
            temperature = temperature.replace('°C', '').strip()
            humidity = humidity.replace('%', '').strip()
            data = {
                'temperature': temperature,
                'humidity': humidity
            }
            return jsonify(data)
        else:
            return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'error': str(e)})