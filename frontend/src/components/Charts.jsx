import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

function Chart({ history }) {
  const data = history.length ? history : [{ cpu: 0, ram: 0 }];

  const chartData = {
    labels: data.map((_, i) => i + 1),
    datasets: [
      {
        label: "CPU",
        data: data.map(d => d.cpu),
        borderColor: "#6c63ff",
        tension: 0.4
      },
      {
        label: "RAM",
        data: data.map(d => d.ram),
        borderColor: "#ffd166",
        tension: 0.4
      }
    ]
  };

  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <div>
          <div className="tarjeta-titulo">
            Rendimiento del Sistema
          </div>
          <div className="tarjeta-subtitulo">
            Últimos segundos
          </div>
        </div>
      </div>

      <div style={{ height: "250px" }}>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default Chart;