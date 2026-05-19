import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import CpuDetail from "./pages/CpuDetail";
import History from "./pages/History";
import Settings from "./pages/Settings";

function App() {
  const [pagina, setPagina] = useState("tablero");
  const [uptime, setUptime] = useState("0h 0m 0s");

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setUptime(`${h}h ${m}m ${sec}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const renderPagina = () => {
    switch (pagina) {
      case "tablero":   return <Dashboard />;
      case "cpu":       return <CpuDetail />;
      case "historial": return <History />;
      case "ajustes":   return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <Sidebar paginaActiva={pagina} onNavegar={setPagina} />
      <div className="principal">
        <Topbar />
        <div className="contenido">
          {renderPagina()}
        </div>
        <div className="barra-inferior">
          <span className="tiempo-activo">Uptime: {uptime} · Polling: 1000ms</span>
          <span className="version">© 2026 PC Monitor Pro v2.4.0</span>
        </div>
      </div>
    </div>
  );
}

export default App;