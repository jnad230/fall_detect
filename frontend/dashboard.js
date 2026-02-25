// ── Clock ──
setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();
}, 1000);

// ── Activity Monitor Canvas ──
const canvas = document.getElementById('activityCanvas');
const ctx = canvas.getContext('2d');
const HISTORY = 100;
const magHistory = new Array(HISTORY).fill(0);
let isFall = false;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function renderActivity() {
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(28,36,48,1)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(f => {
    ctx.beginPath();
    ctx.moveTo(0, h * f);
    ctx.lineTo(w, h * f);
    ctx.stroke();
  });

  // Threshold line at 2g
  const threshY = h - (2.0 / 5.0) * h;
  ctx.strokeStyle = 'rgba(255,196,0,0.3)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, threshY);
  ctx.lineTo(w, threshY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, isFall ? 'rgba(255,23,68,0.3)' : 'rgba(0,230,118,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  magHistory.forEach((v, i) => {
    const x = (i / (HISTORY - 1)) * w;
    const y = h - Math.min(v / 5.0, 1) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = isFall ? '#ff1744' : '#00e676';
  ctx.lineWidth = 2;
  magHistory.forEach((v, i) => {
    const x = (i / (HISTORY - 1)) * w;
    const y = h - Math.min(v / 5.0, 1) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

renderActivity();

function updateActivityLevel(mag) {
  const el = document.getElementById('activityLevel');
  if (mag < 0.2) el.textContent = 'STILL';
  else if (mag < 1.0) el.textContent = 'LOW';
  else if (mag < 2.0) el.textContent = 'ACTIVE';
  else el.textContent = 'HIGH';
}

// ── Falls Over Time Canvas ──
const fallsCanvas = document.getElementById('fallsCanvas');
const fctx = fallsCanvas.getContext('2d');
const fallEvents = [];
const sessionStart = Date.now();

function resizeFallsCanvas() {
  fallsCanvas.width = fallsCanvas.offsetWidth * window.devicePixelRatio;
  fallsCanvas.height = fallsCanvas.offsetHeight * window.devicePixelRatio;
  fctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  renderFalls();
}
resizeFallsCanvas();
window.addEventListener('resize', resizeFallsCanvas);

function renderFalls() {
  const w = fallsCanvas.offsetWidth;
  const h = fallsCanvas.offsetHeight;
  fctx.clearRect(0, 0, w, h);

  // Grid
  fctx.strokeStyle = 'rgba(28,36,48,1)';
  fctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(f => {
    fctx.beginPath();
    fctx.moveTo(0, h * f);
    fctx.lineTo(w, h * f);
    fctx.stroke();
  });

  // Axis labels
  fctx.fillStyle = '#4a5568';
  fctx.font = '10px Space Mono';
  fctx.fillText('5g', 4, 14);
  fctx.fillText('0g', 4, h - 4);

  if (fallEvents.length === 0) return;

  const sessionDuration = Math.max(Date.now() - sessionStart, 60000);

  fallEvents.forEach(f => {
    const x = ((f.time - sessionStart) / sessionDuration) * (w - 20) + 10;
    const y = h - Math.min(f.mag / 5.0, 1) * (h - 20) - 10;

    // Glow
    fctx.beginPath();
    fctx.arc(x, y, 10, 0, Math.PI * 2);
    fctx.fillStyle = 'rgba(255,23,68,0.15)';
    fctx.fill();

    // Dot
    fctx.beginPath();
    fctx.arc(x, y, 5, 0, Math.PI * 2);
    fctx.fillStyle = '#ff1744';
    fctx.fill();

    // Label
    fctx.fillStyle = '#e0e6ed';
    fctx.font = '10px Space Mono';
    fctx.fillText(f.mag.toFixed(1) + 'g', x + 8, y - 4);
  });
}

// ── State ──
let fallCount = 0;
let connected = false;
let lastData = 0;

setInterval(() => {
  if (connected && Date.now() - lastData > 3000) {
    connected = false;
    setConn(false);
    document.getElementById('sensorStatus').textContent = 'Disconnected';
    document.getElementById('sensorStatus').className = 'sensor-val red';
  }
}, 1000);

function setConn(val) {
  const badge = document.getElementById('connBadge');
  badge.className = 'conn-badge ' + (val ? 'online' : 'offline');
  document.getElementById('connText').textContent = val ? 'CONNECTED' : 'WAITING';
}

function setStatus(state) {
  const card = document.getElementById('statusCard');
  card.className = 'status-card ' + state;
  document.getElementById('statusTime').textContent = new Date().toLocaleTimeString();
  const icon = document.getElementById('statusIcon');
  const value = document.getElementById('statusValue');
  const sub = document.getElementById('statusSub');
  if (state === 'monitoring') {
    icon.textContent = '✅'; value.textContent = 'Monitoring';
    sub.textContent = 'No falls detected. Sensor is active.';
    isFall = false;
  } else if (state === 'impact') {
    icon.textContent = '⚠️'; value.textContent = 'Impact Detected';
    sub.textContent = 'High acceleration detected. Checking for fall...';
  } else if (state === 'fall') {
    icon.textContent = '🚨'; value.textContent = 'Fall Detected!';
    sub.textContent = 'A fall has been confirmed. SMS alert sent.';
    isFall = true;
  }
}

// ── Modal ──
function dismiss() {
  document.getElementById('overlay').classList.remove('active');
  setStatus('monitoring');
}

// ── SSE ──
const evtSource = new EventSource('/events');

evtSource.onmessage = (e) => {
  const d = JSON.parse(e.data);
  lastData = Date.now();

  if (!connected) {
    connected = true;
    setConn(true);
    document.getElementById('sensorStatus').textContent = 'Active';
    document.getElementById('sensorStatus').className = 'sensor-val green';
  }

  document.getElementById('lastSeen').textContent = new Date().toLocaleTimeString();

  magHistory.push(d.mag);
  magHistory.shift();
  renderActivity();
  updateActivityLevel(d.mag);

  if (d.event === 'impact') {
    setStatus('impact');
  } else if (d.event === 'fall') {
    setStatus('fall');
    fallCount++;
    const fn = document.getElementById('fallNumber');
    fn.textContent = fallCount;
    fn.className = 'falls-number nonzero';
    document.getElementById('plotEmpty').textContent = fallCount + ' FALL' + (fallCount > 1 ? 'S' : '');
    fallEvents.push({ time: Date.now(), mag: d.mag });
    renderFalls();
    document.getElementById('modalSub').textContent =
      `Fall detected at ${new Date().toLocaleTimeString()}. Please check on the patient immediately.`;
    document.getElementById('overlay').classList.add('active');
  } else if (d.event === 'reset') {
    setStatus('monitoring');
  }
};