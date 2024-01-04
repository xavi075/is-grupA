import React from 'react';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';

import { Scatter, Line } from 'react-chartjs-2';

import 'chartjs-adapter-date-fns';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale);


interface HumidityData {
  date: string;
  humidity: number;
}

interface HumidityChartProps {
  dataInfo: HumidityData[];
}

const HumidityChart: React.FC<HumidityChartProps> = ({ dataInfo }) => {
  const chartData = {
    labels: dataInfo.map((entry) => entry.date),
    datasets: [
      {
        label: 'Humitat (%)',
        data: dataInfo.map((entry) => entry.humidity),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.4)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category' as const,
        labels: dataInfo.map((entry) => entry.date),
      },
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default HumidityChart;
