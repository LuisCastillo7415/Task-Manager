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
      ssetHistory(prev => [...prev.slice(-20), sys.cpu || 0]);

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

      <div style={{ flex: 1 }}>
        <Topbar />

        <div style={{ padding: "20px" }}>
          <h1>Tablero General</h1>

          {/* MÉTRICAS */}
          <div style={{ display: "flex", gap: "10px" }}>
            <MetricCard title="CPU" value={system.cpu} />
            <MetricCard title="RAM" value={system.ram} />
             <MetricCard title="DISCO" value={system.disk} />
          </div>

           
         

          {/* PROCESOS */}
          <ProcessList processes={processes} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;