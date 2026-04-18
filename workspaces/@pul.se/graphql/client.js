import { useCallback } from 'react';

export const useGraphql = function(query) {
  return useCallback(function(variables = {}) {
    return fetch('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    }).then(function(response) {
      if(response.status !== 200) {
        throw new Error(`GraphQL request failed (${ response.status }): ${ resposne.statusText }`);
      }

      return response.json();
    }).then(function({ errors, data }) {
      if(Array.isArray(errors)) {
        throw new Error(errors[0].message);
      }

      return data;
    });
  }, [ query ]);
};
