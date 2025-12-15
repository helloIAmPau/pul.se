import { useContext, createContext, useState, useMemo, useCallback } from 'react';

const Context = createContext();

export const useForm = function() {
  return useContext(Context);
};

export const Form = function({ children, defaults = {}, onSubmit, onValidation, className = '' }) {
  const [ values, setValues ] = useState(defaults);
  const [ errors, setErrors ] = useState({});
  const [ isDirty, setIsDirty ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);

  const register = useCallback(function(name) {
    return {
      name,
      value: values[name] || '',
      error: errors[name],
      onChange: function({ target }) {
        setValues({
          ...values,
          [ name ]: target.value
        });

        setIsDirty(true);
      }
    };
  }, [ values, errors ]);

  const submit = useCallback(function(evt) {
    evt.preventDefault();
    setIsLoading(true);
    setErrors({});

    Promise.resolve().then(function() {
      const errors = onValidation(values);

      if(Object.keys(errors).length > 0) {
        setErrors(errors);

        return;
      }

      return onSubmit(values);
    }).finally(function() {
      setIsLoading(false);
      setIsDirty(false);
    });
  }, [ onValidation, onSubmit, values ]);

  const value = useMemo(function() {
    return {
      register,
      isDirty,
      isLoading,
      disabled: isDirty === false || isLoading === true
    };
  }, [ register, isDirty, isLoading ]);

  return (
    <Context.Provider value={ value }>
      <form onSubmit={ submit } className={ className }>
        { children }
      </form>
    </Context.Provider>
  );
};
