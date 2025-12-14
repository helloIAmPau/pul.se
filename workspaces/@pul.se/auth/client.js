import { useCallback, useMemo } from 'react';
import { client } from '@pul.se/http/client';

export const useAuthClient = function() {
  const getProviders = useCallback(function() {
    return client('/auth/providers');
  }, []);

  const isValid = useCallback(function() {
    return client('/auth/valid');
  }, []);

  return useMemo(function() {
    return {
      getProviders,
      isValid
    };
  }, [ isValid, getProviders ]);
};
