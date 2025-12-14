import { useMemo } from 'react';
import { useForm } from '../../contexts/form';

import { wrapper } from './styles.module.css';

export default function Input({ label, name, placeholder, type }) {
  const { register } = useForm();

  const inputElement = useMemo(function() {
    if(type === 'area') {
      return (
        <textarea { ...register(name) } placeholder={ placeholder } />
      );
    }

    return (
      <input type={ type } { ...register(name) } placeholder={ placeholder } />
    );
  }, [ type, register, placeholder, name ]);

  return (
    <div className={ wrapper }>
      <label htmlFor={ name }>{ label }</label>
      { inputElement }
    </div>
  );
};
