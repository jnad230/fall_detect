from flask import Flask, request
import json

app = Flask(__name__, static_folder='../frontend', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('sensor.html')

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    print(data)
    return 'ok'

app.run(host='0.0.0.0', port=8080)