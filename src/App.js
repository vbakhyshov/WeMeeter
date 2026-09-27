import React from 'react';
import './App.css';
import Router from './Pages/Router/Router';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <div className="App">
                <Router />
            </div>
        </ThemeProvider>
    );
}

export default App;