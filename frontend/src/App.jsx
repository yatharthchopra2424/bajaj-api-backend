import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const sendRequest = async () => {
    setLogs(prevLogs => [...prevLogs, `Request sent at ${new Date().toLocaleTimeString()}`]);
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

  useEffect(() => {
    const interval = setInterval(() => {
      sendRequest();
    }, 13 * 60 * 1000); // 13 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bajaj API Frontend</h1>
        <button onClick={sendRequest}>Send Request</button>
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
