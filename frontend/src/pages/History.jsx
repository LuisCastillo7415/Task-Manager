import { useEffect, useState, useCallback } from "react";
import { getHistory } from "../services/api";
import {
  Chart as ChartJS, LineElement, CategoryScale,
  LinearScale, PointElement, Filler, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend);

const PERIODS = [
  { label: "Última 1 hora", value: "1h" },
  { label: "Últimas 6 horas", value: "6h" },
  { label: "Últimas 24 horas", value: "24h" },
];

const CHART_CONFIGS = [
  {
    key: "cpu",
    title: "CPU Usage",
    color: "#6c63ff",
    bg: "rgba(108,99,255,0.18)",
    unit: "%",
  },
  {
    key: "gpu",
    title: "GPU Usage",
    color: "#00e5c8",
    bg: "rgba(0,229,200,0.13)",
    unit: "%",
  },
  {
    key: "ram",
    title: "RAM",
    color: "#ffd166",
    bg: "rgba(255,209,102,0.13)",
    unit: "%",
  },
  {
    key: "temp",
    title: "Temperatura",
    color: "#ff6b6b",
    bg: "rgba(255,107,107,0.13)",
    unit: "°C",
  },
];

function makeChartData(points, cfg) {
  const labels = points.map((_, i) => i);
  return {
    labels,
    datasets: [
      {
        label: `${cfg.title} (${cfg.unit})`,
        data: points.map(p => p[cfg.key] ?? 0),
        borderColor: cfg.color,
        backgroundColor: cfg.bg,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };
}

function makeOptions(cfg) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    scales: {
      x: { display: false },
      y: {
        min: 0,
        max: cfg.unit === "°C" ? 120 : 100,
        grid: { color: "rgba(30,42,56,0.8)" },
        ticks: { color: "#7a8fa8", font: { size: 10 }, callback: v => `${v}${cfg.unit === "°C" ? "°" : ""}` },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0d1117",
        borderColor: "#1e2a38",
        borderWidth: 1,
        callbacks: { label: ctx => ` ${ctx.parsed.y}${cfg.unit}` },
      },
    },
  };
}

function HistoryChart({ points, cfg, loading }) {
  if (!points || points.length === 0) {
    return (
      <div className="tarjeta" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 12 }}>
        {loading ? (
          <>
            <div style={{
              width: 32, height: 32, border: "3px solid var(--borde)",
              borderTop: `3px solid ${cfg.color}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }} />
            <span style={{ color: "var(--texto-secundario)", fontSize: 13 }}>Recolectando datos…</span>
            <span style={{ color: "var(--texto-tenue)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              El historial se acumula desde que arranca el backend
            </span>
          </>
        ) : (
          <span style={{ color: "var(--texto-tenue)", fontSize: 13 }}>Sin datos en este periodo</span>
        )}
      </div>
    );
  }

  const vals = points.map(p => p[cfg.key] ?? 0);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  const max = vals.length ? Math.max(...vals).toFixed(1) : "—";
  const min = vals.length ? Math.min(...vals).toFixed(1) : "—";

  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <div>
          <div className="tarjeta-titulo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, display: "inline-block", flexShrink: 0 }} />
            {cfg.title} — Últimas 24h
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--texto-secundario)" }}>
          <span>AVG <strong style={{ color: cfg.color }}>{avg}{cfg.unit}</strong></span>
          <span>MAX <strong style={{ color: "var(--peligro)" }}>{max}{cfg.unit}</strong></span>
          <span>MIN <strong style={{ color: "var(--acento2)" }}>{min}{cfg.unit}</strong></span>
        </div>
      </div>
      <div style={{ height: "180px" }}>
        <Line data={makeChartData(points, cfg)} options={makeOptions(cfg)} />
      </div>
    </div>
  );
}

export default function History() {
  const [period, setPeriod] = useState("24h");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uptime, setUptime] = useState("—");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistory(period);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);  // poll every 2s to match backend
    return () => clearInterval(id);
  }, [load]);

  // Uptime ticker
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      setUptime(`${h}h ${m}m ${sec}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const exportCSV = () => {
    if (!data?.points?.length) return;
    const header = "timestamp,cpu,gpu,ram,temp";
    const rows = data.points.map(p =>
      `${new Date(p.ts * 1000).toISOString()},${p.cpu},${p.gpu},${p.ram},${p.temp}`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `historial_${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const points = data?.points || [];

  return (
    <>
      {/* Header */}
      <div className="cabecera-pagina">
        <div>
          <div className="titulo-pagina">Historial del Sistema</div>
          <div className="subtitulo-pagina">Datos históricos de rendimiento y temperatura.</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{
              background: "var(--fondo-tarjeta2)",
              border: "1px solid var(--borde)",
              color: "var(--texto-primario)",
              borderRadius: 10, padding: "8px 14px",
              fontSize: 13, cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            style={{
              background: "var(--acento)", border: "none", color: "#fff",
              borderRadius: 10, padding: "9px 18px", fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif",
              opacity: points.length ? 1 : 0.5,
              transition: "opacity 0.2s",
            }}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {points.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12
        }}>
          {CHART_CONFIGS.map(cfg => {
            const vals = points.map(p => p[cfg.key] ?? 0);
            const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
            return (
              <div key={cfg.key} className="tarjeta" style={{ padding: "14px 18px", borderTop: `2px solid ${cfg.color}` }}>
                <div style={{ fontSize: 10, color: "var(--texto-tenue)", letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>
                  {cfg.title.toUpperCase()} · PROMEDIO
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: cfg.color, letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>
                  {avg}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--texto-secundario)" }}>{cfg.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--texto-tenue)", marginTop: 4 }}>
                  {points.length} muestras · periodo {period}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2×2 chart grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {CHART_CONFIGS.map(cfg => (
          <HistoryChart key={cfg.key} points={points} cfg={cfg} loading={loading} />
        ))}
      </div>

      {/* Footer info */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, color: "var(--texto-tenue)", fontFamily: "'JetBrains Mono', monospace",
        padding: "4px 0"
      }}>
        <span>Uptime: {uptime} · Polling: 5000ms</span>
        <span>{loading ? "🔄 Actualizando…" : `${points.length} puntos cargados`}</span>
      </div>
    </>
  );
}
