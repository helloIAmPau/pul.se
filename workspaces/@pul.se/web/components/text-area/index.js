import { useCallback } from 'react';

import InputGroup from '../input-group';

import { area } from './styles.module.css';

export default function TextArea({ value, label, onChange }) {
  const handler = useCallback(function({ target }) {
    if(typeof(onChange) !== 'function') {
      return;
    }

    onChange(target.value);
  }, [ onChange ]);

  return (
    <InputGroup label={ label }>
      <textarea onChange={ handler } className={ area } value={ value }></textarea>
    </InputGroup>
  );
};
