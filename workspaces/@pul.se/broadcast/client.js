import { useMemo, useState, useLayoutEffect, createContext, useContext } from 'react';
import { io } from 'socket.io-client';

const Context = createContext();

export const useBroadcast = function() {
  return useContext(Context);
};

export const BroadcastProvider = function({ children }) {
  const [ socket, setSocket ] = useState();

  useLayoutEffect(function() {
    const socket = io({
      path: '/broadcast',
      withCredentials: true
    });

    socket.on('connect', function() {
      console.log('Broadcast connected');

      setSocket(socket);
    });

    return function() {
      setSocket();

      socket.disconnect();
    };
  }, []);

  const value = useMemo(function() {
    return {
      socket
    };
  }, [ socket ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
