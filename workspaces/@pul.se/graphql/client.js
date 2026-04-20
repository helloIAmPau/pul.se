import { useCallback } from 'react';
import client from '@pul.se/client';

export const useGraphql = function(query) {
  return useCallback(function(variables = {}) {
    return client('/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables
      })
    });
  }, [ query ]);
};
