import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/nowcast";

function App() {
  const [nowcast, setNowcast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNowcast() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load flood nowcast data.");
        }

        const data = await response.json();
        setNowcast(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNowcast();
  }, []);

  if (loading) {
    return (
      <main className="loading-screen">
        Loading Urban Flood Nowcasting data...
      </main>
    );
  }

  if (error) {
    return (
      <main className="loading-screen error-screen">
        <div>
          <h1>Backend connection failed</h1>
          <p>{error}</p>
          <p>Ensure FastAPI is running at http://127.0.0.1:8000.</p>
        </div>
      </main>
    );
  }

  const severeStreet = nowcast.streets.find(
    (street) => street.risk === "severe"
  );

  const nearCapacityDrain = nowcast.drains.find(
    (drain) => drain.status === "near-capacity"
  );

  const overflowDrain = nowcast.drains.find(
    (drain) => drain.status === "overflow-risk"
  );

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">SIH 2026 · Disaster Management</p>
          <h1>Urban Flood Nowcasting System</h1>
          <p className="subtitle">
            {nowcast.location} · Rainfall, drainage capacity, and street-level
            flood risk.
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Live API Connected
        </div>
      </header>

      <section className="stats-grid">
        <article className="card">
          <p>Rainfall Intensity</p>
          <h2>{nowcast.rainfall_intensity_mm_hr} mm/hr</h2>
          <span>Heavy rainfall expected</span>
        </article>

        <article className="card">
          <p>Flood-Risk Streets</p>
          <h2>{nowcast.flood_risk_streets}</h2>
          <span className="danger">High-risk locations</span>
        </article>

        <article className="card">
          <p>Drainage Alerts</p>
          <h2>{nowcast.drainage_alerts}</h2>
          <span className="warning">Near capacity</span>
        </article>

        <article className="card">
          <p>Forecast Window</p>
          <h2>0–{nowcast.forecast_window_hours} hrs</h2>
          <span>{nowcast.updated_at}</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="map-panel">
          <div className="panel-heading">
            <div>
              <h2>Flood Risk Map</h2>
              <p>Prototype area: {nowcast.location}</p>
            </div>
            <button>+ 60 min forecast</button>
          </div>

          <div className="map-placeholder">
            <div className="road road-one"></div>
            <div className="road road-two"></div>

            <div className="water-zone zone-one">
              {severeStreet?.water_depth_cm ?? 0} cm
            </div>

            <div className="water-zone zone-two">
              {nowcast.streets[1]?.water_depth_cm ?? 0} cm
            </div>

            <div className="drain drain-one">{overflowDrain?.id ?? "D1"}</div>
            <div className="drain drain-two">
              {nearCapacityDrain?.id ?? "D2"}
            </div>

            <p>Interactive flood map will appear here</p>
          </div>

          <div className="legend">
            <span><i className="safe"></i> Safe: 0–5 cm</span>
            <span><i className="moderate"></i> Caution: 5–15 cm</span>
            <span><i className="high"></i> High risk: 15–30 cm</span>
            <span><i className="severe"></i> Severe: 30+ cm</span>
          </div>
        </article>

        <aside className="alerts-panel">
          <h2>Active Alerts</h2>

          <div className="alert severe-alert">
            <strong>Severe flooding predicted</strong>
            <p>
              {severeStreet?.name ?? "Low-lying road"} may reach{" "}
              {severeStreet?.water_depth_cm ?? 0} cm in 60 minutes.
            </p>
          </div>

          <div className="alert warning-alert">
            <strong>Drain capacity warning</strong>
            <p>
              {nearCapacityDrain?.name ?? "Drain"} is operating at{" "}
              {nearCapacityDrain?.capacity_percent ?? 0}% capacity.
            </p>
          </div>

          <div className="alert info-alert">
            <strong>Safe-route available</strong>
            <p>
              Flood-prone streets are marked as avoid/caution for emergency
              routing.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;