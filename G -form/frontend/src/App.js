import React from 'react';
import GuardianForm from './components/GuardianForm';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 Missing Person Report</h1>
        <p>Please fill in all required fields to submit a report. Your information helps us act quickly.</p>
      </header>
      <main>
        <GuardianForm />
      </main>
      <footer className="app-footer">
        <p>All submissions are handled securely and confidentially.</p>
      </footer>
    </div>
  );
}

export default App;
