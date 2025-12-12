  import { useContext, createContext, useMemo } from 'react';

  const Context = createContext();

  export const useStream = function() {
    return useContext(Context);
  };

  export const StreamProvider = function({ children }) {
    const value = useMemo(function() {
      return {
        source: '/streams/playlist.m3u8',
        title: 'Prozzozese vs Milan',
        description: 'Finale valida per la vittoria della coppola di cazzo 2025'
      };
    }, []);

    return (
      <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
