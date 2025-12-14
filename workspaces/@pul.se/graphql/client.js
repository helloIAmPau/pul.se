import { useState, useCallback, useMemo } from 'react';
import { client } from '@pul.se/http/client';

export const useGraphql = function(query) {
  const [ isLoading, setIsLoading ] = useState(false);

  const handler = useCallback(function(variables = {}) {
    return client('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
  }, [ query ]);

  return useMemo(function() {
    return [ handler, isLoading ];
  }, [ handler, isLoading ])
};
