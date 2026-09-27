import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('app_theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('app_theme', mode);
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [mode]);

    const toggleTheme = (newMode) => {
        setMode(newMode);
    };

    const muiTheme = createTheme({
        palette: {
            mode,
            primary: {
                main: '#BA4631',
            },
            background: {
                default: mode === 'dark' ? '#121212' : '#f3f4f6',
                paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={muiTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);