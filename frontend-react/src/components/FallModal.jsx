import { useState } from "react";
import { CHECKLIST } from "../constants/checklist";

export default function FallModal({ time, mag, onDismiss }) {

    const [checked, setChecked] = useState({});
    const [activePhase, setActivePhase] = useState("immediate");

    const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

    const totalItems = CHECKLIST.reduce((acc, s) => acc + s.items.length, 0);
    const totalChecked = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((totalChecked / totalItems) * 100);

    const currentSection = CHECKLIST.find(s => s.id === activePhase);

    return (
        <div className="overlay">
            <div className="checklist-modal">

                <div className="checklist-header">
                    <div className="checklist-title-row">
                        <span className="checklist-icon">🚨</span>
                        <div>
                            <div className="checklist-title">FALL DETECTED</div>
                            <div className="checklist-meta">
                                {time} · Impact {mag.toFixed(1)}g · Based on NSW CEC Post Fall Guide
                            </div>
                        </div>
                        <div className="checklist-progress-ring">
                            <span className="checklist-progress-num">{progress}%</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="checklist-progress-bar">
                        <div className="checklist-progress-fill" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Phase tabs */}
                    <div className="checklist-tabs">
                        {CHECKLIST.map(s => {
                            const done = s.items.filter(i => checked[i.id]).length;
                            return (
                                <button
                                    key={s.id}
                                    className={`checklist-tab${activePhase === s.id ? " active" : ""}`}
                                    style={{ "--tab-color": s.color }}
                                    onClick={() => setActivePhase(s.id)}
                                >
                                    <span className="tab-phase">{s.phase}</span>
                                    <span className="tab-count">{done}/{s.items.length}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Items */}
                <div className="checklist-items">
                    {currentSection.items.map(item => (
                        <div
                            key={item.id}
                            className={`checklist-item${checked[item.id] ? " checked" : ""}`}
                            onClick={() => toggle(item.id)}
                        >
                            <div className="checklist-box" style={{ "--tab-color": currentSection.color }}>
                                {checked[item.id] && "✓"}
                            </div>
                            <div className="checklist-text">{item.text}</div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="checklist-footer">
                    <button className="dismiss-btn" onClick={onDismiss}>
                        {progress === 100 ? "Complete & Dismiss" : `Dismiss (${totalChecked}/${totalItems} done)`}
                    </button>
                </div>

            </div>
        </div>
    );
}