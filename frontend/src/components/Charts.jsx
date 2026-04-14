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
        label: "CPU (%)",
        data: data.map(d => d.cpu),
        borderColor: "#6c63ff",
        backgroundColor: "rgba(108,99,255,0.2)",
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: "RAM (%)",
        data: data.map(d => d.ram),
        borderColor: "#ffd166",
        backgroundColor: "rgba(255,209,102,0.2)",
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default Chart;