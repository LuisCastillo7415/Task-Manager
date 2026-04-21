const COLORES = ["var(--color-cpu)", "var(--color-ram)", "var(--acento)", "var(--color-gpu)", "var(--color-disco)"];

function ProcessList({ processes = [] }) {
  const top = processes.slice(0, 5);

  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <div>
          <div className="tarjeta-titulo">Procesos Activos</div>
          <div className="tarjeta-subtitulo">Top 5 por consumo</div>
        </div>
      </div>
      <div className="lista-procesos">
        {top.length === 0 && (
          <div style={{ color: "var(--texto-tenue)", fontSize: 12 }}>Cargando procesos...</div>
        )}
        {top.map((proc, i) => {
          const cpu = proc.cpu_percent ?? 0;
          return (
            <div className="elemento-proceso" key={proc.pid ?? i}>
              <div style={{ flex: 1 }}>
                <div className="nombre-proceso">{proc.name}</div>
                <div className="sub-proceso">{proc.memory_mb ? `${proc.memory_mb} MB` : "—"}</div>
              </div>
              <div className="contenedor-barra-proceso">
                <div className="barra-proceso">
                  <div
                    className="barra-proceso-relleno"
                    style={{ width: `${Math.min(100, cpu)}%`, background: COLORES[i] }}
                  />
                </div>
              </div>
              <div className="carga-proceso" style={{ color: COLORES[i] }}>
                {cpu.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessList;