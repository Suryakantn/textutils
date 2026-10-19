import React, { useEffect, useState } from 'react';
import './App.css';
import About from './Components/About';
import Navbar from './Components/Navbar';
import TextForm from './Components/TextForm';
import Alert from './Components/Alert';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('textutils-theme') || 'light')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    document.body.dataset.theme = mode
    localStorage.setItem('textutils-theme', mode)
    document.title = `TextUtil - ${mode === 'dark' ? 'Dark' : 'Light'} Mode`
  }, [mode])

  useEffect(() => {
    if (!alert) return undefined
    const timeout = window.setTimeout(() => setAlert(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [alert])

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
  }

  const toggleMode = () => {
    setMode((currentMode) => currentMode === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={`app-shell theme-${mode}`}>
      <Router>
        <Navbar title="TextUtil" mode={mode} toggleMode={toggleMode} />
        <Alert alert={alert} />
        <main className="page-container">
          <Routes>
            <Route path="/about" element={<About mode={mode} />} />
            <Route path="/" element={<TextForm mode={mode} showAlert={showAlert} />} />
          </Routes>
        </main>
        <footer className="site-footer">
          <span>Made for words that matter.</span>
          <span>Your text stays in your browser.</span>
        </footer>
      </Router>
    </div>
  );
}

export default App;
