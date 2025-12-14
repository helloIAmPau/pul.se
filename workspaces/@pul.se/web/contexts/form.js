import { useContext, createContext, useState, useMemo, useCallback } from 'react';

const Context = createContext();

export const useForm = function() {
  return useContext(Context);
};

export const Form = function({ children, defaults = {}, onSubmit, className = '' }) {
  const [ values, setValues ] = useState(defaults);
  const [ isDirty, setIsDirty ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);

  const register = useCallback(function(name) {
    return {
      name,
      value: values[name] || '',
      onChange: function({ target }) {
        setValues({
          ...values,
          [ name ]: target.value
        });

        setIsDirty(true);
      }
    };
  }, [ values ]);

  const submit = useCallback(function(evt) {
    evt.preventDefault();
    setIsLoading(true);

    onSubmit(values).finally(function() {
      setIsLoading(false);
      setIsDirty(false);
    });
  }, [ onSubmit ]);

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
