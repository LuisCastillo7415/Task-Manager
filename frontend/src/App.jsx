import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";

function App() {
  const [pagina, setPagina] = useState("tablero");

  const renderPagina = () => {
    switch (pagina) {
      case "tablero":  return <Dashboard />;
      case "cpu":      return <PlaceholderPage titulo="Detalle de CPU" sub="Monitoreo por núcleo — próximamente" />;
      case "historial":return <PlaceholderPage titulo="Historial del Sistema" sub="Datos históricos — próximamente" />;
      case "ajustes":  return <PlaceholderPage titulo="Configuración" sub="Ajustes del monitor — próximamente" />;
      default:         return <Dashboard />;
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
          <span className="tiempo-activo">Polling: 1000ms · Backend: localhost:5000</span>
          <span className="version">© 2026 PC Monitor Pro v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ titulo, sub }) {
  return (
    <div className="cabecera-pagina">
      <div>
        <div className="titulo-pagina">{titulo}</div>
        <div className="subtitulo-pagina">{sub}</div>
      </div>
    </div>
  );
}

export default App;