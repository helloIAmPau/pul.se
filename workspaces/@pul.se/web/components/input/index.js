import { useMemo } from 'react';

import InputGroup from '../input-group';

import { wrapper, icon_wrapper, input, clickable } from './styles.module.css';

export default function Input({ value, label, readonly, icon, onClick }) {
  const iconElement = useMemo(function() {
    if(icon == null) {
      return;
    }

    let className = icon_wrapper;
    if(typeof(onClick) === 'function') {
      className = `${ className } ${ clickable }`;
    }

    return (
      <div className={ className } onClick={ onClick }>
        { icon }
      </div>
    );
  }, [ icon, onClick ]);

  return (
    <InputGroup label={ label }>
      <div className={ wrapper }>
        { iconElement }
        <input className={ input } value={ value } readOnly={ readonly } />
      </div>
    </InputGroup>
  );
};
