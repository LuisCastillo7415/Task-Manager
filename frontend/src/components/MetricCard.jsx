const CONFIG = {
  CPU:     { clase: "tm-cpu",   icono: "CPU",  color: "var(--color-cpu)",   fondo: "rgba(108,99,255,0.15)",  unidad: "%",    sub: "Procesador" },
  RAM:     { clase: "tm-ram",   icono: "RAM",  color: "var(--color-ram)",   fondo: "rgba(255,209,102,0.1)",  unidad: "%",    sub: "Memoria" },
  DISCO:   { clase: "tm-disco", icono: "DSK",  color: "var(--color-disco)", fondo: "rgba(6,214,160,0.1)",    unidad: "%",    sub: "Almacenamiento" },
};

function MetricCard({ title, value }) {
  const cfg = CONFIG[title] || CONFIG["CPU"];
  const val = value != null ? Math.round(value) : "—";
  const pct = value != null ? Math.min(100, value) : 0;

  return (
    <div className={`tarjeta-metrica ${cfg.clase}`}>
      <div className="tm-cabecera">
        <span className="tm-etiqueta">{title}</span>
        <span className="tm-delta delta-subida">↑ live</span>
      </div>
      <div
        className="tm-icono"
        style={{
          background: cfg.fondo,
          color: cfg.color,
          fontSize: 10,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.5px",
        }}
      >
        {cfg.icono}
      </div>
      <div className="tm-valor">
        {val}<span className="tm-unidad"> {cfg.unidad}</span>
      </div>
      <div className="tm-secundario" style={{ color: "var(--texto-secundario)" }}>
        {cfg.sub}
      </div>
      <div className="tm-barra">
        <div className="tm-barra-relleno" style={{ width: `${pct}%`, background: cfg.color }} />
      </div>
    </div>
  );
}

export default MetricCard;