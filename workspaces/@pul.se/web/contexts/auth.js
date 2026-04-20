import { useContext, createContext, useMemo, useState, useLayoutEffect } from 'react';
import { useAuth as useAuthClient } from '@pul.se/auth/client';

const Context = createContext();

export const useAuth = function() {
  return useContext(Context);
};

export const AuthProvider = function({ children }) {
  const [ state, setState ] = useState('LOADING');
  const { isValid, provider } = useAuthClient();

  useLayoutEffect(function() {
    setState('LOADING');

    isValid().then(function() {
      setState('SIGNED_IN');
    }).catch(function() {
      setState('SIGNED_OUT');
    });
  }, [ isValid ]);

  const value = useMemo(function() {
    return {
      state,
      provider
    };
  }, [ state, provider ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
