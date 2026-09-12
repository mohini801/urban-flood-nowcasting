import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/nowcast";

const FORECAST_STEPS = [0, 30, 60, 120, 180];

const RAINFALL_SCENARIOS = [
  { value: "light", label: "Light Rain" },
  { value: "moderate", label: "Moderate Rain" },
  { value: "extreme", label: "Extreme Rain" },
  { value: "blocked-drain", label: "Blocked Drain Scenario" },
];

const PUNE_CENTER = [18.5204, 73.8567];

const riskColors = {
  safe: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  severe: "#dc2626",
};

const drainStatusColors = {
  normal: "#22c55e",
  "near-capacity": "#f97316",
  "overflow-risk": "#dc2626",
   surcharged: "#7f1d1d",
};

const forecastScenarios = {
  0: {
    rainfall_intensity_mm_hr: 10,
    flood_risk_streets: 0,
    drainage_alerts: 0,
    forecast_window_hours: 3,
    updated_at: "Demo forecast · Now",
    streets: [
      {
        id: "street-1",
        name: "Lowland Junction",
        latitude: 18.5204,
        longitude: 73.8567,
        water_depth_cm: 2,
        risk: "safe",
        status: "safe",
      },
      {
        id: "street-2",
        name: "Station Road",
        latitude: 18.5196,
        longitude: 73.8583,
        water_depth_cm: 3,
        risk: "safe",
        status: "safe",
      },
      {
        id: "street-3",
        name: "Canal Side Road",
        latitude: 18.5216,
        longitude: 73.8552,
        water_depth_cm: 5,
        risk: "safe",
        status: "safe",
      },
    ],
    drains: [
      {
        id: "drain-1",
        name: "Drain D-01",
        capacity_percent: 32,
        blockage_percent: 5,
        status: "normal",
      },
      {
        id: "drain-2",
        name: "Drain D-02",
        capacity_percent: 38,
        blockage_percent: 10,
        status: "normal",
      },
      {
        id: "drain-3",
        name: "Drain D-03",
        capacity_percent: 28,
        blockage_percent: 5,
        status: "normal",
      },
    ],
  },

  30: {
    rainfall_intensity_mm_hr: 28,
    flood_risk_streets: 2,
    drainage_alerts: 1,
    forecast_window_hours: 3,
    updated_at: "Demo forecast · +30 min",
    streets: [
      {
        id: "street-1",
        name: "Lowland Junction",
        latitude: 18.5204,
        longitude: 73.8567,
        water_depth_cm: 9,
        risk: "moderate",
        status: "caution",
      },
      {
        id: "street-2",
        name: "Station Road",
        latitude: 18.5196,
        longitude: 73.8583,
        water_depth_cm: 6,
        risk: "moderate",
        status: "caution",
      },
      {
        id: "street-3",
        name: "Canal Side Road",
        latitude: 18.5216,
        longitude: 73.8552,
        water_depth_cm: 11,
        risk: "moderate",
        status: "caution",
      },
    ],
    drains: [
      {
        id: "drain-1",
        name: "Drain D-01",
        capacity_percent: 62,
        blockage_percent: 15,
        status: "normal",
      },
      {
        id: "drain-2",
        name: "Drain D-02",
        capacity_percent: 79,
        blockage_percent: 30,
        status: "near-capacity",
      },
      {
        id: "drain-3",
        name: "Drain D-03",
        capacity_percent: 58,
        blockage_percent: 10,
        status: "normal",
      },
    ],
  },

  60: {
    rainfall_intensity_mm_hr: 45,
    flood_risk_streets: 3,
    drainage_alerts: 2,
    forecast_window_hours: 3,
    updated_at: "Demo forecast · +60 min",
    streets: [
      {
        id: "street-1",
        name: "Lowland Junction",
        latitude: 18.5204,
        longitude: 73.8567,
        water_depth_cm: 22,
        risk: "high",
        status: "avoid",
      },
      {
        id: "street-2",
        name: "Station Road",
        latitude: 18.5196,
        longitude: 73.8583,
        water_depth_cm: 12,
        risk: "moderate",
        status: "caution",
      },
      {
        id: "street-3",
        name: "Canal Side Road",
        latitude: 18.5216,
        longitude: 73.8552,
        water_depth_cm: 18,
        risk: "high",
        status: "avoid",
      },
    ],
    drains: [
      {
        id: "drain-1",
        name: "Drain D-01",
        capacity_percent: 86,
        blockage_percent: 25,
        status: "near-capacity",
      },
      {
        id: "drain-2",
        name: "Drain D-02",
        capacity_percent: 96,
        blockage_percent: 52,
        status: "overflow-risk",
      },
      {
        id: "drain-3",
        name: "Drain D-03",
        capacity_percent: 74,
        blockage_percent: 12,
        status: "normal",
      },
    ],
  },

  120: {
    rainfall_intensity_mm_hr: 68,
    flood_risk_streets: 3,
    drainage_alerts: 3,
    forecast_window_hours: 3,
    updated_at: "Demo forecast · +120 min",
    streets: [
      {
        id: "street-1",
        name: "Lowland Junction",
        latitude: 18.5204,
        longitude: 73.8567,
        water_depth_cm: 38,
        risk: "severe",
        status: "avoid",
      },
      {
        id: "street-2",
        name: "Station Road",
        latitude: 18.5196,
        longitude: 73.8583,
        water_depth_cm: 25,
        risk: "high",
        status: "avoid",
      },
      {
        id: "street-3",
        name: "Canal Side Road",
        latitude: 18.5216,
        longitude: 73.8552,
        water_depth_cm: 30,
        risk: "high",
        status: "avoid",
      },
    ],
    drains: [
      {
        id: "drain-1",
        name: "Drain D-01",
        capacity_percent: 94,
        blockage_percent: 35,
        status: "overflow-risk",
      },
      {
        id: "drain-2",
        name: "Drain D-02",
        capacity_percent: 100,
        blockage_percent: 70,
        status: "overflow-risk",
      },
      {
        id: "drain-3",
        name: "Drain D-03",
        capacity_percent: 89,
        blockage_percent: 20,
        status: "near-capacity",
      },
    ],
  },

  180: {
    rainfall_intensity_mm_hr: 78,
    flood_risk_streets: 3,
    drainage_alerts: 3,
    forecast_window_hours: 3,
    updated_at: "Demo forecast · +180 min",
    streets: [
      {
        id: "street-1",
        name: "Lowland Junction",
        latitude: 18.5204,
        longitude: 73.8567,
        water_depth_cm: 52,
        risk: "severe",
        status: "avoid",
      },
      {
        id: "street-2",
        name: "Station Road",
        latitude: 18.5196,
        longitude: 73.8583,
        water_depth_cm: 41,
        risk: "severe",
        status: "avoid",
      },
      {
        id: "street-3",
        name: "Canal Side Road",
        latitude: 18.5216,
        longitude: 73.8552,
        water_depth_cm: 35,
        risk: "high",
        status: "avoid",
      },
    ],
    drains: [
      {
        id: "drain-1",
        name: "Drain D-01",
        capacity_percent: 100,
        blockage_percent: 50,
        status: "overflow-risk",
      },
      {
        id: "drain-2",
        name: "Drain D-02",
        capacity_percent: 100,
        blockage_percent: 80,
        status: "overflow-risk",
      },
      {
        id: "drain-3",
        name: "Drain D-03",
        capacity_percent: 98,
        blockage_percent: 40,
        status: "overflow-risk",
      },
    ],
  },
};

const ROUTE_LOCATIONS = [
  { id: "hospital", label: "City Hospital" },
  { id: "bus-stand", label: "Central Bus Stand" },
  { id: "shelter", label: "Emergency Shelter" },
  { id: "control-room", label: "Disaster Control Room" },
];

const ROUTE_OPTIONS = [
  {
    id: "hospital-shelter-direct",
    source: "hospital",
    destination: "shelter",
    name: "Direct route",
    distance_km: 2.1,
    estimated_time_min: 7,
    road_ids: ["road-1", "road-2"],
    positions: [
      [18.5189, 73.8548],
      [18.5195, 73.8557],
      [18.5208, 73.8567],
      [18.5213, 73.8575],
      [18.5221, 73.8584],
    ],
  },
  {
    id: "hospital-shelter-safe",
    source: "hospital",
    destination: "shelter",
    name: "Canal diversion",
    distance_km: 2.9,
    estimated_time_min: 10,
    road_ids: ["road-3"],
    positions: [
      [18.5189, 73.8548],
      [18.5193, 73.8549],
      [18.5200, 73.8548],
      [18.5212, 73.8549],
      [18.5221, 73.8584],
    ],
  },
  {
    id: "hospital-shelter-emergency",
    source: "hospital",
    destination: "shelter",
    name: "Emergency bypass",
    distance_km: 3.3,
    estimated_time_min: 12,
    road_ids: [],
    positions: [
      [18.5189, 73.8548],
      [18.5187, 73.8561],
      [18.5193, 73.8577],
      [18.5206, 73.8589],
      [18.5221, 73.8584],
    ],
  },
  {
    id: "hospital-control-room-direct",
    source: "hospital",
    destination: "control-room",
    name: "Control-room direct route",
    distance_km: 1.8,
    estimated_time_min: 6,
    road_ids: ["road-1"],
    positions: [
      [18.5189, 73.8548],
      [18.5197, 73.8555],
      [18.5208, 73.8567],
      [18.5214, 73.8561],
    ],
  },
  {
    id: "hospital-control-room-safe",
    source: "hospital",
    destination: "control-room",
    name: "Control-room bypass",
    distance_km: 2.5,
    estimated_time_min: 9,
    road_ids: ["road-3"],
    positions: [
      [18.5189, 73.8548],
      [18.5192, 73.8547],
      [18.5201, 73.8546],
      [18.5216, 73.8550],
      [18.5214, 73.8561],
    ],
  },
  {
    id: "bus-stand-shelter-direct",
    source: "bus-stand",
    destination: "shelter",
    name: "Bus stand direct route",
    distance_km: 1.6,
    estimated_time_min: 5,
    road_ids: ["road-2"],
    positions: [
      [18.5194, 73.8592],
      [18.5197, 73.8585],
      [18.5208, 73.8576],
      [18.5221, 73.8584],
    ],
  },
  {
    id: "bus-stand-shelter-safe",
    source: "bus-stand",
    destination: "shelter",
    name: "Bus stand canal diversion",
    distance_km: 2.7,
    estimated_time_min: 9,
    road_ids: ["road-3"],
    positions: [
      [18.5194, 73.8592],
      [18.5200, 73.8580],
      [18.5210, 73.8555],
      [18.5216, 73.8550],
      [18.5221, 73.8584],
    ],
  },
  {
    id: "bus-stand-control-room-direct",
    source: "bus-stand",
    destination: "control-room",
    name: "Control-room direct route",
    distance_km: 1.4,
    estimated_time_min: 5,
    road_ids: ["road-2"],
    positions: [
      [18.5194, 73.8592],
      [18.5197, 73.8585],
      [18.5205, 73.8572],
      [18.5214, 73.8561],
    ],
  },
  {
    id: "bus-stand-control-room-safe",
    source: "bus-stand",
    destination: "control-room",
    name: "Control-room western bypass",
    distance_km: 2.2,
    estimated_time_min: 8,
    road_ids: [],
    positions: [
      [18.5194, 73.8592],
      [18.5190, 73.8578],
      [18.5200, 73.8556],
      [18.5214, 73.8561],
    ],
  },
];



function App() {
    
  const [nowcast, setNowcast] = useState(forecastScenarios[0]);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState("moderate");
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedDrain, setSelectedDrain] = useState(null);
  const [routeSource, setRouteSource] = useState("hospital");
  const [routeDestination, setRouteDestination] = useState("shelter");
  const [routeVisible, setRouteVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [error, setError] = useState("");
   const loadNowcast = async (
  minutes,
  scenarioValue = selectedScenario
) => {
  setBackendStatus("Connecting...");
  setError("");

  try {
    const response = await fetch(
      `${API_URL}?minutes=${minutes}&scenario=${scenarioValue}`
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.streets || !data.drains) {
      throw new Error("Invalid nowcast response from backend");
    }

    console.log("Backend data received:", data);

    setNowcast(data);
    setSelectedMinutes(data.selected_minutes ?? minutes);
    setBackendStatus("Connected");
    setSelectedStreet(null);
    setSelectedDrain(null);
    setRouteVisible(false);
  } catch (err) {
    console.error("Nowcast API error:", err);

    setNowcast(forecastScenarios[minutes] ?? forecastScenarios[0]);
    setSelectedMinutes(minutes);
    setBackendStatus("Offline — Demo mode");
    setError("Backend offline — mock forecast data is active.");
    setSelectedStreet(null);
    setSelectedDrain(null);
    setRouteVisible(false);
  }
};


     useEffect(() => {
       loadNowcast(0);
     }, []);
  const handleForecastChange = (minutes) => {
  loadNowcast(minutes,selectedScenario);
};

  const handleScenarioChange = (event) => {
  const scenario = event.target.value;

  const defaultForecastTime = {
    light: 0,
    moderate: 30,
    extreme: 120,
    "blocked-drain": 180,
  };

  const minutes = defaultForecastTime[scenario] ?? 0;

  setSelectedScenario(scenario);
  loadNowcast(minutes, scenario);
};
    const getSafeRoute = () => {
    const blockedRoads = nowcast.streets.filter(
      (street) =>
        street.risk === "high" ||
        street.risk === "severe" ||
        street.status === "avoid"
    );

    const cautionRoads = nowcast.streets.filter(
      (street) =>
        street.risk === "moderate" ||
        street.status === "caution"
    );

    const routeRisk =
      blockedRoads.length > 0
        ? "Low — flood-prone streets avoided"
        : cautionRoads.length > 0
          ? "Moderate — caution roads nearby"
          : "Low — all roads currently passable";

    const distanceKm = Number(
      (2.4 + blockedRoads.length * 0.35 + cautionRoads.length * 0.1).toFixed(1)
    );

    const estimatedTimeMin = Math.round(
      7 + blockedRoads.length * 2 + cautionRoads.length
    );

    return {
      distance_km: distanceKm,
      estimated_time_min: estimatedTimeMin,
      risk_level: routeRisk,
      avoided_roads: blockedRoads.map((street) => street.name),
      caution_roads: cautionRoads.map((street) => street.name),
    };
  };

  const routeDetails = getSafeRoute();
  const routeAlternatives = ROUTE_OPTIONS
  .filter(
    (route) =>
      route.source === routeSource &&
      route.destination === routeDestination
  )
  .map((route) => {
    const routeStreets = nowcast.streets.filter((street) =>
      route.road_ids.includes(street.id)
    );

    const blockedRoads = routeStreets.filter(
      (street) =>
        street.risk === "high" ||
        street.risk === "severe" ||
        street.status === "avoid"
    );

    const cautionRoads = routeStreets.filter(
      (street) =>
        street.risk === "moderate" ||
        street.status === "caution"
    );

    let safety = "safe";
    let floodPenalty = 0;

    if (blockedRoads.length > 0) {
      safety = "unsafe";
      floodPenalty = 50;
    } else if (cautionRoads.length > 0) {
      safety = "caution";
      floodPenalty = 10;
    }

    return {
      ...route,
      safety,
      blockedRoads: blockedRoads.map((street) => street.name),
      cautionRoads: cautionRoads.map((street) => street.name),
      score: route.distance_km + floodPenalty,
    };
  })
  .sort((a, b) => a.score - b.score);

const recommendedRoute =
  routeAlternatives.find((route) => route.safety === "safe") ??
  routeAlternatives.find((route) => route.safety === "caution") ??
  routeAlternatives[0] ??
  null;

const activeRoute =
  routeAlternatives.find((route) => route.id === selectedRouteId) ??
  recommendedRoute;
  const severeStreet =
    nowcast.streets.find((street) => street.risk === "severe") ??
    nowcast.streets.find((street) => street.risk === "high");

  const nearCapacityDrain =
  nowcast.drains.find((drain) => drain.status === "surcharged") ??
  nowcast.drains.find((drain) => drain.status === "overflow-risk") ??
  nowcast.drains.find((drain) => drain.status === "near-capacity");
  const overflowDrain = nowcast.drains.find(
  (drain) =>
    drain.status === "surcharged" ||
    drain.status === "overflow-risk"
);

  const selectedScenarioLabel =
    RAINFALL_SCENARIOS.find(
      (scenario) => scenario.value === selectedScenario
    )?.label ?? "Moderate Rain";

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">SIH 2026 · Disaster Management</p>
          <h1>Urban Flood Nowcasting System</h1>
          <p className="subtitle">
            Pune Prototype Area · Rainfall, drainage capacity, and street-level
            flood risk.
          </p>
        </div>

        <div
           className={`status ${
             backendStatus === "Connected" ? "connected" : "offline"
      }`}
     >
          <span className="status-dot"></span>
          Backend: {backendStatus}
        </div>
      </header>

      <div className="demo-notice">
         {backendStatus === "Connected"
           ? "Live prototype mode: dashboard is receiving flood-nowcast data from the FastAPI backend."
         :  "Demo mode active: mock nowcast data is active because the backend is unavailable."}
      </div>
      {error && <p className="api-error">{error}</p>}
      <section className="stats-grid">
        <article className="card">
          <p>Rainfall Intensity</p>
          <h2>{nowcast.rainfall_intensity_mm_hr} mm/hr</h2>
          <span>Scenario: {selectedScenarioLabel}</span>
        </article>

        <article className="card">
          <p>Flood-Risk Streets</p>
          <h2>{nowcast.flood_risk_streets}</h2>
          <span className="danger">High-risk locations</span>
        </article>

        <article className="card">
          <p>Drainage Alerts</p>
          <h2>{nowcast.drainage_alerts}</h2>
          <span className="warning">
            {overflowDrain ? "Overflow risk detected" : "Normal operation"}
          </span>
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
              <p>Prototype area: Pune</p>
            </div>

            <div className="scenario-control">
              <label htmlFor="rainfall-scenario">Rainfall scenario</label>
              <select
                id="rainfall-scenario"
                value={selectedScenario}
                onChange={handleScenarioChange}
              >
                {RAINFALL_SCENARIOS.map((scenario) => (
                  <option key={scenario.value} value={scenario.value}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="forecast-controls">
              {FORECAST_STEPS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={
                    selectedMinutes === minutes ? "active-time" : ""
                  }
                  onClick={() => handleForecastChange(minutes)}
                >
                  {minutes === 0 ? "Now" : `+${minutes} min`}
                </button>
              ))}
            </div>
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
                  eventHandlers={{
                    click: () => setSelectedStreet(street),
                  }}
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

              {nowcast.drains.map((drain) => {
                const color = drainStatusColors[drain.status] ?? "#2563eb";

                return (
                  <CircleMarker
                    key={drain.id}
                    center={
  drain.latitude !== undefined && drain.longitude !== undefined
    ? [drain.latitude, drain.longitude]
    : PUNE_CENTER
}
                    radius={9}
                    eventHandlers={{
                      click: () => setSelectedDrain(drain),
                    }}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.95,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <strong>{drain.name}</strong>
                      <br />
                      Capacity used: {drain.capacity_percent}%
                      <br />
                      Blockage: {drain.blockage_percent}%
                      <br />
                      Status: {drain.status}
                    </Popup>
                  </CircleMarker>
                );
              })}

              {routeVisible && (
                <Polyline
                  positions={DEMO_SAFE_ROUTE}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 6,
                    opacity: 0.9,
                    dashArray: "10 8",
                  }}
                >
                  <Popup>
                    <strong>Flood-Safe Route</strong>
                    <br />
                    Estimated time: {routeDetails.estimated_time_min} min
                    <br />
                    Avoiding {routeDetails.avoided_roads.length} high-risk road(s)
                  </Popup>
                </Polyline>
              )}
            </MapContainer>
          </div>

          <div className="legend">
            <span><i className="safe"></i> Safe: 0–5 cm</span>
            <span><i className="moderate"></i> Caution: 5–15 cm</span>
            <span><i className="high"></i> High risk: 15–30 cm</span>
            <span><i className="severe"></i> Severe: 30+ cm</span>
          </div>

          <div className="drain-legend">
            <strong>Drain condition</strong>
            <span><i className="drain-normal"></i> Normal</span>
            <span><i className="drain-near-capacity"></i> Near capacity</span>
            <span><i className="drain-overflow-risk"></i> Overflow risk</span>
          </div>
        </article>

        <aside className="alerts-panel">
          <h2>Active Alerts</h2>

          <div className="scenario-summary">
            <span>Active scenario</span>
            <strong>{selectedScenarioLabel}</strong>
          </div>

          <div className="alert severe-alert">
            <strong>Flood forecast</strong>
            <p>
              {severeStreet?.name ?? "No high-risk road"} may reach{" "}
              {severeStreet?.water_depth_cm ?? 0} cm at{" "}
              {selectedMinutes === 0 ? "present time" : `+${selectedMinutes} min`}.
            </p>
          </div>

          <div className="alert warning-alert">
            <strong>Drain capacity warning</strong>
            <p>
              {nearCapacityDrain?.name ?? "All drains"} is operating at{" "}
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

          <div className="street-details">
            <h3>Selected Street</h3>

            {selectedStreet ? (
              <>
                <p className="street-name">{selectedStreet.name}</p>

                <div className="street-detail-row">
  <span>Predicted depth</span>
  <strong>{selectedStreet.water_depth_cm} cm</strong>
</div>
<div className="street-detail-row">
  <span>Terrain sensitivity</span>
  <strong>{selectedStreet.terrain_factor ?? "--"}×</strong>
</div>

<div className="street-detail-row">
  <span>Drain overflow</span>
  <strong>{selectedStreet.drain_overflow_lps ?? 0} L/s</strong>
</div>

<div className="street-detail-row">
  <span>Drain impact</span>
  <strong>{selectedStreet.drain_impact ?? "--"}</strong>
</div>

                <div className="street-detail-row">
                  <span>Risk level</span>
                  <strong className={`risk-text ${selectedStreet.risk}`}>
                    {selectedStreet.risk}
                  </strong>
                </div>

                <div className="street-detail-row">
                  <span>Route status</span>
                  <strong>{selectedStreet.status}</strong>
                </div>

                <div className="street-detail-row">
                  <span>Selected forecast</span>
                  <strong>
                    {selectedMinutes === 0
                      ? "Now"
                      : `+${selectedMinutes} min`}
                  </strong>
                </div>
              </>
            ) : (
              <p className="street-placeholder">
                Click a flood-risk street marker on the map to inspect predicted
                water depth and route condition.
              </p>
            )}
          </div>

          <div className="street-details">
            <h3>Selected Drain</h3>

            {selectedDrain ? (
              <>
                <p className="street-name">{selectedDrain.name}</p>

                <div className="street-detail-row">
  <span>Capacity used</span>
  <strong>{selectedDrain.capacity_percent}%</strong>
</div>

<div className="street-detail-row">
  <span>Effective capacity</span>
  <strong>{selectedDrain.effective_capacity_lps ?? "--"} L/s</strong>
</div>

<div className="street-detail-row">
  <span>Rainfall inflow</span>
  <strong>{selectedDrain.estimated_inflow_lps ?? "--"} L/s</strong>
</div>

<div className="street-detail-row">
  <span>Overflow</span>
  <strong>{selectedDrain.overflow_lps ?? "--"} L/s</strong>
</div>

                <div className="street-detail-row">
                  <span>Blockage</span>
                  <strong>{selectedDrain.blockage_percent}%</strong>
                </div>

                <div className="street-detail-row">
                  <span>Condition</span>
                  <strong>{selectedDrain.status}</strong>
                </div>
              </>
            ) : (
              <p className="street-placeholder">
                Click a drain marker on the map to inspect its capacity and
                blockage status.
              </p>
            )}
          </div>

          <div className="route-planner">
            <h3>Flood-Safe Route</h3>

            <label htmlFor="route-source">From</label>
            <select
              id="route-source"
              value={routeSource}
              onChange={(event) => setRouteSource(event.target.value)}
            >
              {ROUTE_LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>

            <label htmlFor="route-destination">To</label>
            <select
              id="route-destination"
              value={routeDestination}
              onChange={(event) => setRouteDestination(event.target.value)}
            >
              {ROUTE_LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="route-button"
              onClick={() => {
  setSelectedRouteId(recommendedRoute?.id ?? null);
  setRouteVisible(true);
}}
             
           >
            Find Flood-Safe Route
          </button>

           {routeVisible && (
  <div className="route-result">
    <strong>Flood-safe route generated</strong>

    <p>
      From:{" "}
      {
        ROUTE_LOCATIONS.find(
          (location) => location.id === routeSource
        )?.label
      }
    </p>

    <p>
      To:{" "}
      {
        ROUTE_LOCATIONS.find(
          (location) => location.id === routeDestination
        )?.label
      }
    </p>

    <p>
      Distance: {routeDetails.distance_km} km ·{" "}
      {routeDetails.estimated_time_min} min
    </p>

    <p>Route assessment: {routeDetails.risk_level}</p>

    <p>
      Avoiding:{" "}
      {routeDetails.avoided_roads.length > 0
        ? routeDetails.avoided_roads.join(", ")
        : "No high-risk roads"}
    </p>

    {routeDetails.caution_roads.length > 0 && (
      <p>
        Caution near: {routeDetails.caution_roads.join(", ")}
      </p>
    )}
  </div>
)} 
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;