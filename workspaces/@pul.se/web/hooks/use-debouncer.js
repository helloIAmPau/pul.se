import { useCallback, useRef } from 'react';

export default function(handler, deps = [], timeout = 200) {
  const ref = useRef();

  return useCallback(function() {
    clearTimeout(ref.current);

    ref.current = setTimeout(function() {
      handler();
    }, timeout);
  }, deps.concat([ timeout ]));
};
