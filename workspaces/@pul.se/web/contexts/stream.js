import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';

const Context = createContext();

export const useStream = function() {
  return useContext(Context);
};

export const StreamProvider = function({ children }) {
  const [ stream, setStream ] = useState({ state: 'LOADING' });
  const [ isDirty, setIsDirty ] = useState(false);

  const { app } = useParams();

/* --- GET DATA --- */
  const streamQuery = useGraphql(`
query($app: UUID!) {
  stream(app: $app) {
    app,
    name,
    key
  }
}
  `);

  const refresh = useCallback(function() {
    streamQuery({
      app
    }).then(function({ stream }) {
      setStream(stream);
      setIsDirty(false);
    });
  }, [ app, streamQuery ]);

  useLayoutEffect(function() {
    refresh();
  }, [ refresh ]);

/* --- REGENERATE KEY --- */

  const regenerateKeyMutation = useGraphql(`
mutation($app: UUID!) {
  regenerateKey(app: $app) {
    key
  }
}
  `);

  const regenerateKey = useCallback(function() {
    regenerateKeyMutation({ app }).then(function() {
      refresh();
    });
  }, [ regenerateKeyMutation, refresh, app ]);

/* --- UPDATE TITLE --- */

  const updateNameMutation = useGraphql(`
mutation($name: NameInput!) {
  updateName(name: $name) {
    name
  }
}
  `);

  const setName = useCallback(function(name) {
    if(stream.state === 'LOADING') {
      return;
    }

    setIsDirty(true);

    setStream({
      ...stream,
      name
    });
  }, [ stream ]);

  const updateName = useCallback(function() {
    if(isDirty === false) {
      return;
    }

    updateNameMutation({
      name: {
        app: stream.app,
        name: stream.name
      }
    }).then(function() {
      refresh();
    });
  }, [ isDirty, refresh, updateNameMutation, stream ]);

/* --- DELETE --- */

  const deleteStreamMutation = useGraphql(`
mutation($app: UUID!) {
  deleteStream(app: $app) {
    app
  }
}
  `);

  const deleteStream = useCallback(function() {
    return deleteStreamMutation({ app });
  }, [ app, deleteStreamMutation ]);

  const value = useMemo(function() {
    return {
      ...stream,
      isDirty,
      setName,
      regenerateKey,
      updateName,
      deleteStream
    };
  }, [ stream, setName, isDirty, regenerateKey, updateName, deleteStream ]);

  return (
    <Context.Provider value={ value }>
      { children }
    </Context.Provider>
  );
};
