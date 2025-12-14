import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { wrapper, empty } from './styles.module.css';

export default function Button({ children, secondary, href, onClick, type='button', disabled }) {
  const navigate = useNavigate();

  const className = useMemo(function() {
    if(secondary === true) {
      return `${ wrapper } ${ empty }`;
    }

    return wrapper;
  }, [ secondary ]);

  const handler = useCallback(function() {
    if(href != null) {
      navigate(href);

      return;
    }

    if(onClick == null) {
      return;
    }

    onClick();
  }, [ href, onClick, navigate ]);

  return (
    <button disabled={ disabled } onClick={ handler } type={ type } className={ className }>{ children }</button>
  );
};
