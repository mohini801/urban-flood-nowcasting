import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/nowcast";
const FORECAST_STEPS = [0, 60, 120, 180];
const PUNE_CENTER = [18.5204, 73.8567];

const riskColors = {
  safe: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  severe: "#dc2626",
};

function drainPosition(index) {
  const positions = [
    [18.5202, 73.8561],
    [18.5194, 73.8581],
    [18.5216, 73.8550],
  ];

  return positions[index] ?? PUNE_CENTER;
}

function App() {
  const [nowcast, setNowcast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
  async function loadNowcast() {
    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}?minutes=${selectedMinutes}`
      );

      if (!response.ok) {
        throw new Error("Could not load flood nowcast data.");
      }

      const data = await response.json();
      setNowcast(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }

  loadNowcast();
}, [selectedMinutes]);

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
            <button
  type="button"
  disabled={updating}
  onClick={() => {
    const currentIndex = FORECAST_STEPS.indexOf(selectedMinutes);
    const nextIndex = (currentIndex + 1) % FORECAST_STEPS.length;
    setSelectedMinutes(FORECAST_STEPS[nextIndex]);
  }}
>
  {updating
    ? "Updating..."
    : selectedMinutes === 0
      ? "+ 60 min forecast"
      : `Forecast: +${selectedMinutes} min`}
</button>
          </div>

          <div className="map-wrapper">
  <MapContainer
    center={PUNE_CENTER}
    zoom={15}
    scrollWheelZoom={true}
    className="flood-map"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {nowcast.streets.map((street) => (
      <CircleMarker
        key={street.id}
        center={[street.latitude, street.longitude]}
        radius={Math.max(10, street.water_depth_cm / 2)}
        pathOptions={{
          color: riskColors[street.risk] ?? "#2563eb",
          fillColor: riskColors[street.risk] ?? "#2563eb",
          fillOpacity: 0.7,
          weight: 2,
        }}
      >
        <Popup>
          <strong>{street.name}</strong>
          <br />
          Predicted water depth: {street.water_depth_cm} cm
          <br />
          Risk level: {street.risk}
          <br />
          Route status: {street.status}
        </Popup>
      </CircleMarker>
    ))}

    {nowcast.drains.map((drain, index) => (
      <Marker key={drain.id} position={drainPosition(index)}>
        <Popup>
          <strong>{drain.name}</strong>
          <br />
          Capacity used: {drain.capacity_percent}%
          <br />
          Blockage: {drain.blockage_percent}%
          <br />
          Status: {drain.status}
        </Popup>
      </Marker>
    ))}
  </MapContainer>
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