function Sidebar({ paginaActiva, onNavegar }) {
  const items = [
    { id: "tablero", icono: "⊞", label: "Dashboard" },
    { id: "cpu",     icono: "⚙️", label: "CPU Detail" },
    { id: "historial", icono: "📈", label: "History" },
    { id: "ajustes", icono: "⚙",  label: "Settings" },
  ];

  return (
    <aside className="barra-lateral">
      <div className="logotipo">
        <div className="logotipo-icono">📊</div>
        <span className="logotipo-texto">PC Monitor</span>
      </div>
      <nav>
        {items.map(item => (
          <div
            key={item.id}
            className={`elemento-nav ${paginaActiva === item.id ? "activo" : ""}`}
            onClick={() => onNavegar(item.id)}
          >
            <span className="icono-nav">{item.icono}</span> {item.label}
          </div>
        ))}
      </nav>
      <div className="pie-barra-lateral">
        <div>© 2026 PC Monitor Pro v2.4.0</div>
        <div className="carga-global">
          GLOBAL LOAD
          <div className="barra-mini">
            <div className="barra-mini-relleno" style={{ width: "42%" }} />
          </div>
          <span>42%</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;