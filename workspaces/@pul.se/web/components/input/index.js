import { useMemo } from 'react';
import { useForm } from '../../contexts/form';

import { wrapper, error_border, error_message } from './styles.module.css';

export default function Input({ label, name, placeholder, type, options }) {
  const { register } = useForm();
  const { value, error, onChange } = register(name);

  const inputElement = useMemo(function() {
    const className = error != null ? error_border : '';

    if(type === 'area') {
      return (
        <textarea className={ className } name={ name } onChange={ onChange } value={ value } placeholder={ placeholder } />
      );
    }

    if(type === 'select') {
      const optionElements = options.map(function({ label, value }) {
        return (
          <option key={ value } value={ value }>{ label }</option>
        );
      });

      return (
        <select className={ className } name={ name } onChange={ onChange } value={ value }>
          { optionElements }
        </select>
      );
    }

    return (
      <input className={ className } name={ name } type={ type } onChange={ onChange } value={ value } placeholder={ placeholder } />
    );
  }, [ type, value, error, onChange, placeholder, name, options ]);

  return (
    <div className={ wrapper }>
      <label htmlFor={ name }>{ label }</label>
      { inputElement }
      <div className={ error_message }>{ error }</div>
    </div>
  );
};
