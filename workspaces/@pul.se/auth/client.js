import { useMemo, useCallback } from 'react';

import client from '@pul.se/client';

export const useAuth = function() {
  const isValid = useCallback(function() {
    return client('/auth/valid');
  }, []);

  const provider = useCallback(function(type) {
    return client(`/auth/providers/${ type }`).then(function({ provider }) {
      const state = JSON.stringify({
        type,
        redirect: window.location.href
      });

      provider.authorization = `${ provider.authorization }&state=${ state }`;
      return provider;
    });
  }, [])

  return useMemo(function() {
    return {
      isValid,
      provider
    };
  }, [ provider, isValid ]);
};
