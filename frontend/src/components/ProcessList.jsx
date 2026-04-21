function ProcessList({ processes }) {
  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <div>
          <div className="tarjeta-titulo">Procesos Activos</div>
          <div className="tarjeta-subtitulo">Top consumo CPU</div>
        </div>
      </div>

      <div className="lista-procesos">
        {processes.map((p, i) => (
          <div key={i} className="elemento-proceso">
            <span>{p.name}</span>
            <span>{p.cpu}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ProcessList;