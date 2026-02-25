import { useState, useEffect } from "react";

export default function Clock() {
    const [t, setT] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const id = setInterval(() => setT(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(id);
    }, []);

    return <div className="clock">{t}</div>;
}