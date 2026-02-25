import math
import time
import json
from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import logging
from dotenv import load_dotenv
import os
from twilio.rest import Client
import queue
import threading

load_dotenv()

TWILIO_SID = os.getenv('TWILIO_SID')
TWILIO_TOKEN = os.getenv('TWILIO_TOKEN')
TWILIO_FROM = os.getenv('TWILIO_FROM')
TWILIO_TO = os.getenv('TWILIO_TO')

client = Client(TWILIO_SID, TWILIO_TOKEN)

SSL_CERT = os.getenv('SSL_CERT')
SSL_KEY = os.getenv('SSL_KEY')

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# SSE client queues — one per connected dashboard
sse_clients = []
sse_lock = threading.Lock()

def push_event(data: dict):
    """Push an event to all connected SSE clients."""
    with sse_lock:
        dead = []
        for q in sse_clients:
            try:
                q.put_nowait(data)
            except queue.Full:
                dead.append(q)
        for q in dead:
            sse_clients.remove(q)

# --- Gravity vector recorded while standing ---
g_before = None

# --- State machine ---
state = 'monitoring'
impact_time = None
g_after = None

# Thresholds (paper: 2g, 2s, 90° ± 30°)
A_THRESHOLD = 2.0   # g
T_THRESHOLD = 2.0   # seconds
G_THRESHOLD = 0.3   # tolerance around 1g for "lying still"
ANGLE_MIN = 60
ANGLE_MAX = 120

def magnitude(ax, ay, az):
    return math.sqrt(ax**2 + ay**2 + az**2)

def compute_rotation_angle(g1, g2):
    dot = g1[0]*g2[0] + g1[1]*g2[1] + g1[2]*g2[2]
    mag1 = magnitude(*g1)
    mag2 = magnitude(*g2)
    if mag1 == 0 or mag2 == 0:
        return 0
    cos_angle = max(-1, min(1, dot / (mag1 * mag2)))
    return math.degrees(math.acos(cos_angle))

@app.route('/')
def index():
    return app.send_static_file('sensor.html')

@app.route('/dashboard')
def dashboard():
    return app.send_static_file('dashboard.html')

@app.route('/events')
def events():
    """SSE endpoint for the dashboard."""
    q = queue.Queue(maxsize=50)
    with sse_lock:
        sse_clients.append(q)

    def stream():
        try:
            while True:
                try:
                    data = q.get(timeout=15)
                    yield f"data: {json.dumps(data)}\n\n"
                except queue.Empty:
                    # Heartbeat to keep connection alive
                    yield ": heartbeat\n\n"
        except GeneratorExit:
            with sse_lock:
                if q in sse_clients:
                    sse_clients.remove(q)

    return Response(
        stream_with_context(stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/data', methods=['POST'])
def receive_data():
    global g_before, state, impact_time, g_after

    data = request.get_json()

    # Convert m/s² to g
    ax = data['ax'] / 9.81
    ay = data['ay'] / 9.81
    az = data['az'] / 9.81
    a_mag = magnitude(ax, ay, az)

    # Always push raw data to dashboard
    push_event({'ax': ax, 'ay': ay, 'az': az, 'mag': a_mag, 'event': None})

    # Step 1: record g_before while standing (first ~1g reading)
    if g_before is None:
        if abs(a_mag - 1.0) < G_THRESHOLD:
            g_before = (ax, ay, az)
            print(f"g_before recorded: {g_before}")
        return 'ok'

    # Step 2: monitoring state - watch for impact
    if state == 'monitoring':
        if a_mag >= A_THRESHOLD:
            print(f"Impact detected! |a| = {a_mag:.2f}g")
            state = 'impact'
            impact_time = time.time()
            push_event({'ax': ax, 'ay': ay, 'az': az, 'mag': a_mag, 'event': 'impact'})

    # Step 3: impact state - wait for stillness
    elif state == 'impact':
        elapsed = time.time() - impact_time

        if elapsed > T_THRESHOLD:
            if abs(a_mag - 1.0) < G_THRESHOLD:
                g_after = (ax, ay, az)
                angle = compute_rotation_angle(g_before, g_after)
                print(f"g_after recorded. Rotation angle: {angle:.1f}°")

                if ANGLE_MIN <= angle <= ANGLE_MAX:
                    print("🚨 FALL DETECTED!")
                    push_event({'ax': ax, 'ay': ay, 'az': az, 'mag': a_mag, 'event': 'fall'})
                    # client.messages.create(
                    #     body="🚨 Fall detected! Please check on your person immediately.",
                    #     from_=TWILIO_FROM,
                    #     to=TWILIO_TO
                    # )
                    print("SMS sent!")
                else:
                    print(f"No fall — angle {angle:.1f}° outside range")
                    push_event({'ax': ax, 'ay': ay, 'az': az, 'mag': a_mag, 'event': 'reset'})

                state = 'monitoring'
            elif elapsed > 5.0:
                print("Impact timeout — resetting")
                state = 'monitoring'
                push_event({'ax': ax, 'ay': ay, 'az': az, 'mag': a_mag, 'event': 'reset'})

    return 'ok'

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app.run(host='0.0.0.0', port=8080, ssl_context=(SSL_CERT, SSL_KEY), threaded=True)