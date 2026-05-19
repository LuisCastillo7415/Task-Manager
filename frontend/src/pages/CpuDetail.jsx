import { useEffect, useState } from "react";
import { getCpuDetail } from "../services/api";
import {
  Chart as ChartJS, LineElement, CategoryScale,
  LinearScale, PointElement, Filler, Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip);

/* ── helpers ── */
const colorFor = (val) => {
  if (val > 80) return "var(--peligro)";
  if (val > 60) return "var(--advertencia)";
  return "var(--acento)";
};

const tempColor = (t) => {
  if (t > 80) return "var(--peligro)";
  if (t > 65) return "var(--advertencia)";
  return "var(--acento2)";
};

export default function CpuDetail() {
  const [data, setData] = useState(null);
  const [pollMs, setPollMs] = useState(1000);

  useEffect(() => {
    const load = async () => {
      try { setData(await getCpuDetail()); } catch (e) { console.error(e); }
    };
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  if (!data) return (
    <div className="cabecera-pagina">
      <div>
        <div className="titulo-pagina">Detalle de CPU</div>
        <div className="subtitulo-pagina">Conectando al backend…</div>
      </div>
    </div>
  );

  const history = data.history || [];
  const chartData = {
    labels: history.map((_, i) => i),
    datasets: [
      { label: "Uso (%)", data: history.map(h => h.cpu), borderColor: "#6c63ff", backgroundColor: "rgba(108,99,255,0.15)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: "Temp (°C)", data: history.map(h => h.temp), borderColor: "#00e5c8", backgroundColor: "rgba(0,229,200,0.08)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    ]
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 200 },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100, grid: { color: "rgba(30,42,56,0.8)" }, ticks: { color: "#7a8fa8", font: { size: 10 } } }
    },
    plugins: {
      legend: { labels: { color: "#7a8fa8", font: { size: 11 }, boxWidth: 10, usePointStyle: true } },
      tooltip: { backgroundColor: "#0d1117", borderColor: "#1e2a38", borderWidth: 1 }
    }
  };

  const pollOptions = [
    { label: "500ms (Rápido)", value: 500 },
    { label: "1000ms (Estándar)", value: 1000 },
    { label: "2000ms (Lento)", value: 2000 },
  ];

  return (
    <>
      {/* Header */}
      <div className="cabecera-pagina">
        <div>
          <div className="titulo-pagina" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            Detalle de CPU
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--acento)", fontFamily: "'JetBrains Mono', monospace" }}>
              ID: {data.cpu_name?.split(' ').slice(0, 4).join(' ') || "CPU"}
            </span>
          </div>
          <div className="subtitulo-pagina">
            Monitoreo en tiempo real de {data.core_count} núcleos ({data.phys_count}P + {data.core_count - data.phys_count}E) · Arquitectura moderna
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <select
            className="selector-periodo"
            value={pollMs}
            onChange={e => setPollMs(Number(e.target.value))}
            style={{
              background: "var(--fondo-tarjeta2)", border: "1px solid var(--borde)",
              color: "var(--texto-secundario)", borderRadius: 10, padding: "8px 14px",
              fontSize: 13, cursor: "pointer", fontFamily: "'Syne', sans-serif"
            }}
          >
            {pollOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 metric cards */}
      <div className="fila-metricas" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <MetricBlock
          label="Uso Total" value={`${data.cpu_total}`} unit="%"
          sub={`↑ +2.1% · Carga equilibrada entre núcleos`}
          icon="💻" iconBg="rgba(108,99,255,0.15)" color="var(--color-cpu)"
        />
        <MetricBlock
          label="Frecuencia Turbo" value={`${data.freq_current}`} unit="GHz"
          sub="Promedio de núcleos de rendimiento"
          icon="⚡" iconBg="rgba(0,229,200,0.12)" color="var(--acento2)"
        />
        <MetricBlock
          label="Voltaje Núcleo" value={`${data.voltage}`} unit="V"
          sub="Estado dinámico VID"
          icon="⚡" iconBg="rgba(255,170,0,0.15)" color="var(--advertencia)"
        />
        <MetricBlock
          label="Temperatura Pkg" value={`${data.temp_pkg}`} unit="°C"
          sub={`↓ -4°C · Margen térmico de ${Math.round(100 - data.temp_pkg)}°C`}
          icon="🌡️" iconBg="rgba(255,68,68,0.12)" color={tempColor(data.temp_pkg)}
        />
      </div>

      {/* Chart + Top Processes */}
      <div className="fila-graficos">
        <div className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <div className="tarjeta-titulo">Historial de Rendimiento</div>
              <div className="tarjeta-subtitulo">Últimos 60 segundos de telemetría de uso y calor</div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--texto-secundario)", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#6c63ff", display: "inline-block" }} />
                Uso (%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e5c8", display: "inline-block" }} />
                Temp (°C)
              </span>
            </div>
          </div>
          <div style={{ height: "240px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Processes */}
        <div className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <div className="tarjeta-titulo">Procesos Asociados</div>
            </div>
            <span style={{ fontSize: 11, color: "var(--texto-tenue)", fontFamily: "'JetBrains Mono', monospace" }}>
              Top 5 por impacto en CPU
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 8px", fontSize: 10, color: "var(--texto-tenue)", letterSpacing: 1, fontWeight: 700 }}>
              <span>PROCESO</span><span>CARGA</span>
            </div>
            {(data.top_processes || []).map((p, i) => {
              const colors = ["var(--peligro)", "var(--advertencia)", "var(--acento)", "var(--acento2)", "var(--color-disco)"];
              const c = colors[i % colors.length];
              return (
                <div key={i} className="elemento-proceso">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nombre-proceso" style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div className="sub-proceso">{p.mem_gb} GB · {p.user}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 60, height: 4, background: "var(--borde)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, p.cpu * 3)}%`, background: c, borderRadius: 2, transition: "width 1s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: c, width: 44, textAlign: "right" }}>
                      {p.cpu}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Core grid */}
      <div className="tarjeta">
        <div className="tarjeta-cabecera">
          <div>
            <div className="tarjeta-titulo">Uso por Núcleo</div>
            <div className="tarjeta-subtitulo">Distribución de carga entre {data.core_count} hilos lógicos</div>
          </div>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: 10
        }}>
          {(data.cpu_per_core || []).map((val, i) => (
            <div key={i} style={{
              background: "var(--fondo-tarjeta2)", border: "1px solid var(--borde)",
              borderRadius: 10, padding: "10px 8px", textAlign: "center",
              borderTop: `2px solid ${colorFor(val)}`
            }}>
              <div style={{ fontSize: 10, color: "var(--texto-tenue)", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                CORE {i}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: colorFor(val), fontFamily: "'JetBrains Mono', monospace" }}>
                {val}<span style={{ fontSize: 10 }}>%</span>
              </div>
              <div style={{ height: 3, background: "var(--borde)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
                <div style={{ height: "100%", width: `${val}%`, background: colorFor(val), borderRadius: 2, transition: "width 1s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MetricBlock({ label, value, unit, sub, icon, iconBg, color }) {
  return (
    <div className="tarjeta-metrica" style={{ borderTop: `2px solid ${color}` }}>
      <div className="tm-cabecera">
        <span className="tm-etiqueta">{label}</span>
        <div className="tm-icono" style={{ background: iconBg, fontSize: 16 }}>{icon}</div>
      </div>
      <div className="tm-valor" style={{ color }}>
        {value}<span className="tm-unidad"> {unit}</span>
      </div>
      <div className="tm-secundario">{sub}</div>
    </div>
  );
}
