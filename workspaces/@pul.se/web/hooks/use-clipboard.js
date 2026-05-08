import { useMemo, useCallback } from 'react';

export default function useClipboard() {
  const copy = useCallback(function(value) {
    navigator.clipboard.writeText(value).then(function() {
      console.log('Copied');
    });
  }, []);

  return useMemo(function() {
    return {
      copy
    };
  }, [ copy ]);
};
