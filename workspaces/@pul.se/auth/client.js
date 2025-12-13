import { useCallback, useMemo } from 'react';
import { client } from './http';

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
