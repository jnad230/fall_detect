import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { STATUS_CONFIG } from "./constants/status";
import Clock from "./components/Clock";
import ActivityCanvas from "./components/ActivityCanvas";
import FallsCanvas from "./components/FallsCanvas";
import FallModal from "./components/FallModal";

const FLASK_URL = import.meta.env.VITE_FLASK_URL;
const HISTORY = 100;


function activityLabel(mag) {
  if (mag < 0.2) return "STILL";
  if (mag < 1.0) return "LOW";
  if (mag < 2.0) return "ACTIVE";
  return "HIGH";
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("monitoring");
  const [statusTime, setStatusTime] = useState("—");
  const [lastSeen, setLastSeen] = useState("—");
  const [sensorStatus, setSensorStatus] = useState("Active");
  const [fallCount, setFallCount] = useState(0);
  const [fallEvents, setFallEvents] = useState([]);
  const [magHistory, setMagHistory] = useState(new Array(HISTORY).fill(0));
  const [currentMag, setCurrentMag] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalTime, setModalTime] = useState("");
  const [modalMag, setModalMag] = useState(0);

  const sessionStart = useRef(Date.now());
  const lastDataRef = useRef(0);
  const impactMagRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastDataRef.current > 3000 && lastDataRef.current > 0) {
        setConnected(false);
        setSensorStatus("Disconnected");
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const es = new EventSource(`${FLASK_URL}/events`);
    es.onmessage = (e) => {
      let d;
      try {
        d = JSON.parse(e.data);
      } catch {
        console.warn("Malformed SSE payload:", e.data);
        return;
      }

      lastDataRef.current = Date.now();
      setConnected(prev => {
        if (!prev) setSensorStatus("Active");
        return true;
      });

      setLastSeen(new Date().toLocaleTimeString());
      setCurrentMag(d.mag);

      setMagHistory(prev => [...prev.slice(1), d.mag]);

      if (d.event === "impact") {
        impactMagRef.current = d.mag;
        setStatus("impact");
        setStatusTime(new Date().toLocaleTimeString());
      }
      else if (d.event === "fall") {
        setStatus("fall");
        setStatusTime(new Date().toLocaleTimeString());
        setFallCount(c => c + 1);
        setFallEvents(prev => [...prev, { time: Date.now(), mag: impactMagRef.current }]);
        setModalTime(new Date().toLocaleTimeString());
        setModalMag(d.mag);
        setShowModal(true);
      }
      else if (d.event === "reset") {
        setStatus("monitoring");
        setStatusTime(new Date().toLocaleTimeString());
      }
    };

    es.onerror = () => {
      setConnected(false);
      setSensorStatus("Reconnecting…");
    };

    return () => es.close();
  }, []);

  const dismiss = useCallback(() => {
    setShowModal(false);
    setStatus("monitoring");
    setStatusTime(new Date().toLocaleTimeString());
  }, []);

  const cfg = STATUS_CONFIG[status];

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">FG</div>
          FallDetect
        </div>
        <div className="header-right">
          <Clock />
          <div className={`conn-badge${connected ? " online" : ""}`}>
            <div className="conn-dot" />
            {connected ? "CONNECTED" : "WAITING"}
          </div>
        </div>
      </header>

      <main className="main">
        <div className={`card status-card ${status}`}>
          <div className="status-icon">{cfg.icon}</div>
          <div className="status-body">
            <div className="status-label">System Status</div>
            <div className="status-value">{cfg.label}</div>
            <div className="status-sub">{cfg.sub}</div>
          </div>
          <div className="status-time">{statusTime}</div>
        </div>

        <div className="card activity-card">
          <div className="card-header">
            <div className="card-title">Activity Monitor</div>
            <div className="card-label">{activityLabel(currentMag)}</div>
          </div>
          <ActivityCanvas magHistory={magHistory} isFall={status === "fall"} />
        </div>

        <div className="right-panel">
          <div className="card falls-card">
            <div className="card-title">Falls This Session</div>
            <div className={`falls-number ${fallCount === 0 ? "zero" : "nonzero"}`}>{fallCount}</div>
            <div className="falls-sub">since monitoring began</div>
          </div>

          <div className="card sensor-card">
            <div className="card-title">Monitor Info</div>
            <div className="sensor-rows">
              <div className="sensor-row">
                <div className="sensor-key">Sensor</div>
                <div className="sensor-val">iPhone (IMU)</div>
              </div>
              <div className="sensor-row">
                <div className="sensor-key">Status</div>
                <div className={`sensor-val ${connected ? "green" : "red"}`}>{sensorStatus}</div>
              </div>
              <div className="sensor-row">
                <div className="sensor-key">Last Seen</div>
                <div className="sensor-val">{lastSeen}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card falls-plot-card">
          <div className="card-header">
            <div className="card-title">Falls Over Time</div>
            <div className="card-label">
              {fallEvents.length === 0 ? "NO FALLS YET" : `${fallEvents.length} FALL${fallEvents.length > 1 ? "S" : ""}`}
            </div>
          </div>
          <FallsCanvas fallEvents={fallEvents} sessionStart={sessionStart.current} />
        </div>
      </main>

      {showModal && <FallModal time={modalTime} mag={modalMag} onDismiss={dismiss} />}
    </>
  );
}