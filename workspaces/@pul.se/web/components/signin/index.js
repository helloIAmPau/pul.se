import { useMemo } from 'react';
import { useAuth } from '../../contexts/auth';

import Card from '../card';
import Button from '../button';

import { signin, heading, card } from './styles.module.css';

export default function Signin() {
  const { providers } = useAuth();

  const buttons = useMemo(function() {
    return providers.map(function({ icon, label, authorization, id }) {
      const state = JSON.stringify({
        id,
        returnTo: window.location.pathname
      });

      return (
        <Button secondary href={ `${ authorization }&state=${state}` } key={ id }>{ label }</Button>
      );
    });
  }, [ providers ]);

  return (
    <div className={ signin }>
      <Card className={ card }>
        <h1 className={ heading }>Sign in for PUL.SE</h1>
        <div>
          { buttons }
        </div>
      </Card>
    </div>
  );
};
