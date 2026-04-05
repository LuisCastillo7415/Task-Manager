import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function Chart({ data = [] }) {
  const safeData = data.length ? data : [0];

  const chartData = {
    labels: safeData.map((_, i) => i),
    datasets: [
      {
        label: "CPU %",
        data: safeData,
      },
    ],
  };

  return <Line data={chartData} />;
}

export default Chart;