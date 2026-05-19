import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Legend, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Legend, Tooltip);

function Charts({ history = [] }) {
  const data = history.length ? history : [{ cpu: 0, ram: 0 }];
  const chartData = {
    labels: data.map((_, i) => i + 1),
    datasets: [
      { label: "CPU", data: data.map(d => d.cpu), borderColor: "#6c63ff", backgroundColor: "rgba(108,99,255,0.15)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: "RAM", data: data.map(d => d.ram), borderColor: "#ffd166", backgroundColor: "rgba(255,209,102,0.10)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }
    ]
  };
  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    scales: { x: { display: false }, y: { min: 0, max: 100, grid: { color: "rgba(30,42,56,0.8)" }, ticks: { color: "#7a8fa8", font: { size: 10 } } } },
    plugins: { legend: { labels: { color: "#7a8fa8", font: { size: 11 }, boxWidth: 10 } }, tooltip: { backgroundColor: "#0d1117", borderColor: "#1e2a38", borderWidth: 1 } }
  };
  return (
    <div className="tarjeta">
      <div className="tarjeta-cabecera">
        <div>
          <div className="tarjeta-titulo">Rendimiento del Sistema</div>
          <div className="tarjeta-subtitulo">Ultimos 60 segundos en tiempo real</div>
        </div>
        
      </div>
      <div style={{ height: "220px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default Charts;