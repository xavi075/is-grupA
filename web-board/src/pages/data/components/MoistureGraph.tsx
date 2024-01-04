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
  temperature: number
}

interface HumidityChartProps {
  dataInfo: HumidityData[];
}

export const HumidityChart: React.FC<HumidityChartProps> = ({ dataInfo }) => {
  const chartData = {
    labels: dataInfo.reverse().map((entry) => entry.date),
    datasets: [
      {
        label: 'Humitat (%)',
        data: dataInfo.map((entry) => ({
          x: entry.date,
          y: entry.humidity,
        })),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.4)',
      },
      {
        label: 'Temperatura (ºC)',
        data: dataInfo.map((entry) => ({
          x: entry.date,
          y: entry.temperature,
        })),
        fill: false,
        borderColor: 'rgba(255,0,60,1)',
        backgroundColor: 'rgba(255,0,60,0.4)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        labels: dataInfo.map((entry) => entry.date.toString()),
      },
      y:
        {
          beginAtZero: true,
          max: 100,
        },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const TemperatureChart: React.FC<HumidityChartProps> = ({ dataInfo }) => {
  const chartData = {
    labels: dataInfo.reverse().map((entry) => entry.date),
    datasets: [
      {
        label: 'Temperatura (ºC)',
        data: dataInfo.map((entry) => ({
          x: entry.date,
          y: entry.temperature,
        })),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.4)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        labels: dataInfo.map((entry) => entry.date.toString()),
      },
      y:
        {
          beginAtZero: true,
          max: 100,
        },
    },
  };

  return <Line data={chartData} options={options} />;
};

// export default HumidityChart;
