function Sidebar() {
  return (
    <aside className="barra-lateral">
      <div className="logotipo">
        <div className="logotipo-icono">📊</div>
        <span className="logotipo-texto">PC Monitor</span>
      </div>

      <nav>
        <div className="elemento-nav activo">Dashboard</div>
        <div className="elemento-nav">CPU Detail</div>
        <div className="elemento-nav">History</div>
        <div className="elemento-nav">Settings</div>
      </nav>
    </aside>
  );
}

export default Sidebar;