import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('apiLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });
  const [timeLeft, setTimeLeft] = useState(13 * 60);

  // Function to send the request and log it
  const sendRequest = async () => {
    const newLog = `Request sent at ${new Date().toLocaleTimeString()}`;
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      localStorage.setItem('apiLogs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });

    try {
      const res = await fetch('https://bajaj-api-backend-fv5w.onrender.com/hackrx/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: "https://hackrx.blob.core.windows.net/assets/policy.pdf?sv=2023-01-03&st=2025-07-04T09%3A11%3A24Z&se=2027-07-05T09%3A11%3A00Z&sr=b&sp=r&sig=N4a9OU0w0QXO6AOIBiu4bpl7AXvEZogeT%2FjUHNO7HzQ%3D",
          questions: [
            "What is the grace period for premium payment under the National Parivar Mediclaim Plus Policy?",
          ]
        }),
      });
      const data = await res.json();
      setResponse(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResponse(null);
    }
  };

  // Function to start a new timer cycle
  const startNewTimerCycle = () => {
    const endTime = Date.now() + 13 * 60 * 1000;
    localStorage.setItem('timerEndTime', endTime);
    setTimeLeft(13 * 60);
    sendRequest();
  };

  // Effect for the main timer logic
  useEffect(() => {
    const endTime = localStorage.getItem('timerEndTime');
    if (!endTime || Date.now() > parseInt(endTime, 10)) {
      // If no timer is set or it has expired, start a new cycle.
      startNewTimerCycle();
    }

    const timerInterval = setInterval(() => {
      const storedEndTime = localStorage.getItem('timerEndTime');
      if (storedEndTime) {
        const remaining = Math.floor((parseInt(storedEndTime, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          // Time's up, start a new cycle
          startNewTimerCycle();
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Manual request handler
  const handleManualRequest = () => {
    startNewTimerCycle();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bajaj API Frontend</h1>
        <p>Time until next request: {formatTime(timeLeft)}</p>
        <button onClick={handleManualRequest}>Send Request Now</button>
        {response && (
          <div>
            <h2>Response:</h2>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div>
            <h2>Error:</h2>
            <p>{error}</p>
          </div>
        )}
        <div>
          <h2>Logs:</h2>
          <p>Total requests sent: {logs.length}</p>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
