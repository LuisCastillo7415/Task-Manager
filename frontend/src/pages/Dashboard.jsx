import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MetricCard from "../components/MetricCard";
import ProcessList from "../components/ProcessList";
import Chart from "../components/Charts";
import { getSystemData, getProcesses } from "../services/api";

function Dashboard() {
  const [system, setSystem] = useState({});
  const [processes, setProcesses] = useState([]);
 const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const sys = await getSystemData();
      const proc = await getProcesses();
     setHistory(prev => [
  ...prev.slice(-20),
  {
    cpu: sys.cpu || 0,
    ram: sys.ram || 0
  }
]);

      setSystem(sys);
      setProcesses(proc);
    };

    loadData();

    // 🔁 actualización cada 1s
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div style={{ display: "flex" }}>
    <Sidebar />

    <div className="principal">
      <Topbar />

      <div className="contenido">
        <div className="pagina activa">

          {/* CABECERA */}
          <div className="cabecera-pagina">
            <div>
              <div className="titulo-pagina">Tablero General</div>
              <div className="subtitulo-pagina">
                Monitoreo en tiempo real
              </div>
            </div>
          </div>

          {/* MÉTRICAS */}
          <div className="fila-metricas">
            <MetricCard title="CPU" value={system.cpu} />
            <MetricCard title="RAM" value={system.ram} />
            <MetricCard title="DISCO" value={system.disk} />
          </div>

          {/* GRAFICOS + PROCESOS */}
          <div className="fila-graficos">
            <Chart history={history} />
            <ProcessList processes={processes} />
          </div>

        </div>
      </div>
    </div>
  </div>
);
  
}

export default Dashboard;