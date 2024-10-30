import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data,label }) => {
  const chartData = {
    labels: label,
    datasets: [
      {
        label: 'Tasks Done',
        data: data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, // Allow the chart to resize based on container
  };

  return (
    <div style={{ width: '400px', height: '400px' }}> {/* Set the container size */}
      <h2>Tasks Done</h2>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default PieChart;
