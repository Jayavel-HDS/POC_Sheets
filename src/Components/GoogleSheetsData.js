import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const rows = process.env.REACT_APP_Row;
const columns = process.env.REACT_APP_Column;
const RANGE =`Sheet1!${rows}:${columns}`;
//const RANGE = 'Sheet1!A1:D10'; 

const GoogleSheetsData = () => {
  const [data, setData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
    console.log("Function starts")
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    }).then(response => {
      const sheetData = response.result.values;
      if (sheetData && sheetData.length > 0) {
        setData(sheetData);
        console.log(sheetData)
      } else {
        console.log('No data found.');
      }
    }).catch(error => console.error('Error fetching data:', error));
  };

  return (
    <div>
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
    </div>
  );
};

export default GoogleSheetsData;
