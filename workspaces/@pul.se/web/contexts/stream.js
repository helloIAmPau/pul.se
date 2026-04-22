import { useLayoutEffect, useContext, createContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';

const Context = createContext();

export const useStream = function() {
  return useContext(Context);
};

export const StreamProvider = function({ children }) {
  const [ stream, setStream ] = useState({ state: 'LOADING' });

  const { app } = useParams();

  const streamQuery = useGraphql(`
query($app: UUID!) {
  stream(app: $app) {
    app,
    name,
    url,
    state,
    timestamp
  }
}
  `);

  useLayoutEffect(function() {
    streamQuery({ app }).then(function({ stream }) {
      setStream(stream);
    });
  }, [ streamQuery, app ]);

  const value = useMemo(function() {
    return {
      ...stream
    };
  }, [ stream ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
