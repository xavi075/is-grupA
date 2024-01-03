import React from 'react';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);


interface HumidityData {
  date: string;
  humidity: number;
}

interface HumidityChartProps {
  dataInfo: HumidityData[];
}

const HumidityChart: React.FC<HumidityChartProps> = ({ dataInfo }) => {
  // const chartData = {
  //   labels: data.map((entry) => entry.date),
  //   datasets: [
  //     {
  //       label: 'Humedad (%)',
  //       data: data.map((entry) => entry.humidity),
  //       fill: false,
  //       pointRadius: 5,
  //       pointHoverRadius: 8,
  //       borderColor: 'rgba(75,192,192,1)',
  //       backgroundColor: 'rgba(75,192,192,0.4)',
  //     },
  //   ],
  // };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const data = {
    labels: dataInfo.map((entry) => entry.date),
    datasets: [
      {
        label: 'Humitat (%)',
        data: dataInfo.map((entry) => entry.humidity),
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.4)',
      },
    ],
  };

  return <Scatter options={options} data={data} />;
};

export default HumidityChart;
