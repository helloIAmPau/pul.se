import { useMemo } from 'react';

import { wrapper, primary } from './styles.module.css';

export default function Button({ children, onClick, type='button', className='', accent, disabled }) {
  const styles = useMemo(function() {
    if(accent === true) {
      return `${ wrapper } ${ primary } ${ className }`;
    }

    return `${ wrapper } ${ className }`;
  }, [ accent, className ]);

  return (
    <button disabled={ disabled } onClick={ onClick } type={ type } className={ styles }>{ children }</button>
  );
};
