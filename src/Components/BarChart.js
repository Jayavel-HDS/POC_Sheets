import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register the necessary components for a bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ data ,label}) => {
  console.log(data,"data")
  const chartData = {
    labels: label,
    datasets: [
      {
        label: 'Tasks Done',
        data: data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, // Allows custom sizing
    scales: {
      y: {
        beginAtZero: true, // Start the y-axis at 0
      },
    },
  };

  return (
    <div style={{ width: '800px', height: '400px' }}> {/* Adjust the width and height as needed */}
      <h2>Tasks Done</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default BarChart;
