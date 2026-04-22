import { useMemo } from 'react';

import { wrapper, htwo } from './styles.module.css';

export default function Heading({ children, className='', secondary }) {
  const styles = useMemo(function() {
    if(secondary === true) {
      return `${ wrapper } ${ htwo }`;
    }

    return wrapper;
  }, [ secondary ]);

  return (
    <h1 className={ `${ styles } ${ className }` }>{ children }</h1>
  );
}
