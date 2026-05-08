import { useLayoutEffect, useContext, createContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';

const Context = createContext();

export const useStreamSession = function() {
  return useContext(Context);
};

export const StreamSessionProvider = function({ children }) {
  const [ streamSession, setStreamSession ] = useState({ state: 'LOADING' });

  const { app } = useParams();

  const streamSessionQuery = useGraphql(`
query($app: UUID!) {
  streamSession(app: $app) {
    app,
    name,
    url,
    state,
    timestamp
  }
}
  `);

  useLayoutEffect(function() {
    streamSessionQuery({ app }).then(function({ streamSession }) {
      setStreamSession(streamSession);
    });
  }, [ streamSessionQuery, app ]);

  const value = useMemo(function() {
    return {
      ...streamSession
    };
  }, [ streamSession ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
