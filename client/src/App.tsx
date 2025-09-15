import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface ApiResponse {
  message: string;
}

function App() {
  const [data, setData] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('/api/data');
      setData(response.data.message);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const sendData = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/data', {
        name: inputValue
      });
      setData(response.data.message);
      setInputValue('');
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className="App">
      <h1>React + Node.js App</h1>
      <p>Data from backend: {data}</p>
      
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={sendData}>Send</button>
      </div>
    </div>
  );
}

export default App;