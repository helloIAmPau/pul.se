import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';
import { useBroadcast } from '@pul.se/broadcast/client';

const Context = createContext();

export const useStream = function() {
  return useContext(Context);
};

export const StreamProvider = function({ children }) {
  const [ stream, setStream ] = useState({ settings: { storage: {} } });

  const { socket } = useBroadcast();
  const { app } = useParams();

  const streamQuery = useGraphql(`
query($app: UUID!) {
  stream(app: $app) {
    app,
    name,
    key,
    settings
  }
}
  `);

  useLayoutEffect(function() {
    const refresh = function(evt) {
      if(app !== evt.app) {
        return;
      }

      streamQuery({
        app
      }).then(function({ stream }) {
        setStream(stream);
      });
    };

    if(socket == null) {
      return;
    }

    socket.on('streams', refresh);
    refresh({ app });
    
    return function() {
      socket.off('streams', refresh);
    };
  }, [ app, socket ]);

  const value = useMemo(function() {
    return {
      stream
    };
  }, [ stream ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
