import "./App.css";

function App() {
  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">SIH 2026 · Disaster Management</p>
          <h1>Urban Flood Nowcasting System</h1>
          <p className="subtitle">
            Real-time rainfall, drainage capacity, and street-level flood risk.
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Live Monitoring
        </div>
      </header>

      <section className="stats-grid">
        <article className="card">
          <p>Rainfall Intensity</p>
          <h2>42 mm/hr</h2>
          <span>Heavy rainfall expected</span>
        </article>

        <article className="card">
          <p>Flood-Risk Streets</p>
          <h2>7</h2>
          <span className="danger">High-risk locations</span>
        </article>

        <article className="card">
          <p>Drainage Alerts</p>
          <h2>3</h2>
          <span className="warning">Near capacity</span>
        </article>

        <article className="card">
          <p>Forecast Window</p>
          <h2>0–3 hrs</h2>
          <span>Updated just now</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="map-panel">
          <div className="panel-heading">
            <div>
              <h2>Flood Risk Map</h2>
              <p>Prototype area: Pune ward demo</p>
            </div>
            <button>+ 60 min forecast</button>
          </div>

          <div className="map-placeholder">
            <div className="road road-one"></div>
            <div className="road road-two"></div>
            <div className="water-zone zone-one">28 cm</div>
            <div className="water-zone zone-two">14 cm</div>
            <div className="drain drain-one">D1</div>
            <div className="drain drain-two">D2</div>
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
            <p>Low-lying road near Drain D1 may reach 28 cm in 60 minutes.</p>
          </div>

          <div className="alert warning-alert">
            <strong>Drain capacity warning</strong>
            <p>Drain D2 is operating at 87% capacity.</p>
          </div>

          <div className="alert info-alert">
            <strong>Safe-route available</strong>
            <p>An alternate route has been generated for emergency vehicles.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;