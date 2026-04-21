import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import ProcessList from "../components/ProcessList";
import Charts from "../components/Charts";
import { getSystemData, getProcesses } from "../services/api";

function Dashboard() {
  const [system, setSystem] = useState({});
  const [processes, setProcesses] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sys = await getSystemData();
        const proc = await getProcesses();
        setHistory(prev => [...prev.slice(-60), { cpu: sys.cpu || 0, ram: sys.ram || 0 }]);
        setSystem(sys);
        setProcesses(proc);
      } catch (e) {
        console.error("Error:", e);
      }
    };
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="cabecera-pagina">
        <div>
          <div className="titulo-pagina">Tablero General</div>
          <div className="subtitulo-pagina">Monitoreo en tiempo real del sistema.</div>
        </div>
      </div>
      <div className="banner-alerta">
        <div className="icono-alerta">!</div>
        <div className="texto-alerta">
          <div className="titulo-alerta">Monitoreo Activo</div>
          <div className="descripcion-alerta">Sistema conectado al backend Flask. Datos actualizandose cada 1 segundo.</div>
        </div>
      </div>
      <div className="fila-metricas">
        <MetricCard title="CPU" value={system.cpu} />
        <MetricCard title="RAM" value={system.ram} />
        <MetricCard title="DISCO" value={system.disk} />
       
      </div>
      <div className="fila-graficos">
        <Charts history={history} />
        <ProcessList processes={processes} />
      </div>
    </>
  );
}

export default Dashboard;