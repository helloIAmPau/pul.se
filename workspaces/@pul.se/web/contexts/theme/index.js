import { useContext, createContext, useLayoutEffect, useState, useMemo } from 'react';

import { light_theme, dark_theme } from './styles.module.css';

const Context = createContext();

export const useTheme = function() {
  return useContext(Context);
};

export const ThemeProvider = function({ children }) {
  const [ currentTheme, setCurrentTheme ] = useState('LIGHT');

  useLayoutEffect(function() {
    const lastUsedTheme = localStorage.getItem('LAST_USED_THEME');
    if(lastUsedTheme !== 'LIGHT' && lastUsedTheme !== 'DARK') {
      return;
    }

    setCurrentTheme(lastUsedTheme);
  }, []);

  const value = useMemo(function() {
    return {
      currentTheme,
      switchTheme: function() {
        const selectedTheme = currentTheme === 'LIGHT' ? 'DARK' : 'LIGHT';

        localStorage.setItem('LAST_USED_THEME', selectedTheme);
        setCurrentTheme(selectedTheme);
      }
    };
  }, [ currentTheme ]);

  const cssTheme = useMemo(function() {
    if(currentTheme === 'LIGHT') {
      return light_theme;
    }

    return dark_theme;
  }, [ currentTheme ]);

  return (
    <Context.Provider value={ value }>
      <div className={ cssTheme }>
        { children }
      </div>
    </Context.Provider>
  );
};
