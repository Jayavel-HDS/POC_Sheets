import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import PieChart from './PieChart';
import BarChart from './BarChart';
import '../Stylings/GoogleSheetsData.css'

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;

const rows = process.env.REACT_APP_Row;
const columns = process.env.REACT_APP_Column;

const RANGE = `Sheet1!${rows}:${columns}`;

const GoogleSheetsData = () => {
  const [data, setData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartLabel, setChartLabel] = useState([]);

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      }).then(() => {
        const auth = gapi.auth2.getAuthInstance();
        setIsSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen(setIsSignedIn);
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  const signIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const signOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  const fetchData = () => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    }).then(response => {
      const sheetData = response.result.values;
      if (sheetData && sheetData.length > 0) {
        setData(sheetData);
        handleTransformData(sheetData);
      } else {
        console.log('No data found.');
      }
    }).catch(error => console.error('Error fetching data:', error));
  };

  const handleTransformData = (sheetData) => {
    let arr1 = [];
    let arr2 = [];
    for(let i =1;i<sheetData.length;i++){
      arr1.push(sheetData[i][0]);
      arr2.push(sheetData[i][4]);
    }
    setChartLabel([].concat(arr1));
    setChartData([].concat(arr2));
    console.log(arr1,arr2,"Data-Label")
  };

  return (
    <div className="container">
      <h1>Google Sheets Data Display</h1>
      {isSignedIn ? (
        <>
          <button onClick={signOut}>Sign Out</button>
          <button onClick={fetchData}>Fetch Data</button>
        </>
      ) : (
        <button onClick={signIn}>Sign In with Google</button>
      )}
      
      <table border="1">
        <thead>
          <tr>
            {data[0] && data[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {chartData.length ? <div>
      <h1>Task Completion Chart</h1>
      <div className="chart-container">
        <div className="chart-box">
          <PieChart data={chartData} label={chartLabel} />
        </div>
        <div className="chart-box">
          <BarChart data={chartData} label={chartLabel} />
        </div>
      </div>
      </div> : <></>}
    </div>
  );
};

export default GoogleSheetsData;
