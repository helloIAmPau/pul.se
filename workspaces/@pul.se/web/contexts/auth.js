import { useContext, createContext, useState, useMemo, useLayoutEffect } from 'react';
import { useAuthClient } from '@pul.se/auth/client';

const Context = createContext();

export const useAuth = function() {
  return useContext(Context);
};

export const AuthProvider = function({ children }) {
  const [ state, setState ] = useState('LOADING');
  const [ providers, setProviders ] = useState([]);
  const { getProviders, isValid } = useAuthClient();

  useLayoutEffect(function() {
    getProviders().then(function({ providers }) {
      setProviders(providers);
      return isValid();
    }).then(function() {
      setState('SIGNED_IN');
    }).catch(function() {
      setState('SIGNED_OUT');
    });
  }, []);

  const value = useMemo(function() {
    return {
      state,
      providers
    };
  }, [ state, providers ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
