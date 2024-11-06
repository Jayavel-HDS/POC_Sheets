// GoogleSheetsApp.js
import React, { useState, useEffect, useRef } from 'react';
import { gapi } from 'gapi-script';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import '../Stylings/GoogleSheetsData.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;

const GoogleSheetsApp = () => {
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [sortOrder, setSortOrder] = useState('Asc');

  // Reference for the table
  const tableRef = useRef();

  useEffect(() => {
    function start() {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            'https://sheets.googleapis.com/$discovery/rest?version=v4',
          ],
          scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        })
        .then(fetchSheetNames)
        .catch((error) => console.error('Error initializing GAPI client:', error));
    }
    gapi.load('client:auth2', start);
  }, []);

  const fetchSheetNames = async () => {
    try {
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheets = response.result.sheets;
      const names = sheets.map((sheet) => sheet.properties.title);
      setSheetNames(names);
      setActiveSheet(names[0]);
    } catch (error) {
      console.error('Error fetching sheet names:', error);
    }
  };

  const fetchSheetData = async (sheetName) => {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}`,
      });
      setSheetData(response.result.values || []);
      console.log(response.result.values, 'Response');
    } catch (error) {
      console.error(`Error fetching data for ${sheetName}:`, error);
    }
  };

  useEffect(() => {
    if (activeSheet) {
      fetchSheetData(activeSheet);
    }
  }, [activeSheet]);

  const sortColumnB = () => {
    if (sheetData.length <= 1) return;
    const header = sheetData[0];
    const rows = sheetData.slice(1);

    rows.sort((a, b) => {
      const aValue = a[1] || '';
      const bValue = b[1] || '';
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortOrder === 'Asc' ? aValue - bValue : bValue - aValue;
      } else {
        return sortOrder === 'Asc'
          ? aValue.toString().localeCompare(bValue)
          : bValue.toString().localeCompare(aValue);
      }
    });

    setSheetData([header, ...rows]);
    setSortOrder(sortOrder === 'Asc' ? 'Desc' : 'Asc');
  };

  // Extract chart data from column A and B if sheet is 'Attendance'
  const getChartData = () => {
    if (sheetData.length <= 1) return { labels: [], data: [], chartTitle: '' };
    const labels = sheetData.slice(1).map((row) => row[0] || '');
    const data = sheetData.slice(1).map((row) => Number(row[1]) || 0);
    const chartTitle = sheetData[0][1] || 'Attendance Chart';
    return { labels, data, chartTitle };
  };

  const { labels, data, chartTitle } =
    activeSheet === 'Attendance' ? getChartData() : { labels: [], data: [], chartTitle: '' };

  // Chart configurations
  const pieData = {
    labels,
    datasets: [
      {
        label: chartTitle,
        data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF',
        ],
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: chartTitle,
        data,
        backgroundColor: '#36A2EB',
      },
    ],
  };

  // Chart options (optional customization)
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };
 

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Sheets</h2>
        {sheetNames.map((name) => (
          <button
            key={name}
            className={`sidebar-button ${activeSheet === name ? 'active' : ''}`}
            onClick={() => setActiveSheet(name)}
          >
            {name}
          </button>
        ))}
      </aside>
      <main className="content">
        <div className="header">
          <h2>{activeSheet}</h2>
          <button className="sort-button" onClick={sortColumnB}>
            Sort {sortOrder === 'Asc' ? '↓' : '↑'}: {sortOrder === 'Asc' ? 'Desc' : 'Asc'}
          </button>
        </div>

        {activeSheet === 'Attendance' && sheetData.length > 1 && (
          <>
          <h3>{sheetData[0][1] || 'Attendance Chart'}</h3>
          <div className="charts-container">
            <div className="chart">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className="chart">
              <Bar data={barData} options={barOptions} width={200} height={250}/>
            </div>
          </div>
          </>
        )}

        <div className="table-container" ref={tableRef}>
          <table>
            <thead>
              <tr>
                {sheetData[0] &&
                  sheetData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default GoogleSheetsApp;
