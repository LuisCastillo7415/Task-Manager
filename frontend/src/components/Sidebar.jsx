function Sidebar() {
  return (
    <aside className="barra-lateral">
      <div className="logotipo">
        <div className="logotipo-icono">📊</div>
        <span className="logotipo-texto">PC Monitor</span>
      </div>

      <nav>
        <div className="elemento-nav activo">
          <span className="icono-nav">⊞</span> Dashboard
        </div>
        <div className="elemento-nav">
          <span className="icono-nav">⚙️</span> CPU Detail
        </div>
        <div className="elemento-nav">
          <span className="icono-nav">📈</span> History
        </div>
        <div className="elemento-nav">
          <span className="icono-nav">⚙</span> Settings
        </div>
      </nav>

      <div className="pie-barra-lateral">
        <div>© 2026 PC Monitor</div>
      </div>
    </aside>
  );
}
export default Sidebar;