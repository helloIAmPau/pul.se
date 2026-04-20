import { useLayoutEffect, useState, useMemo } from 'react';

import { useAuth } from '../../contexts/auth';

import logo from './logo.svg';

import { wrapper, brand } from './styles.module.css';

export default function GoogleButton() {
  const [ info, setInfo ] = useState();
  const { provider } = useAuth();

  useLayoutEffect(function() {
    provider('google').then(function(provider) {
      setInfo(provider)
    });
  }, [ provider ]);

  if(info == null) {
    return;
  }

  return (
    <a href={ `${ info.authorization }` } className={ wrapper }>
      <img className={ brand } src={ logo } />
      <div>Signin with Google</div>
    </a>
  );
};
