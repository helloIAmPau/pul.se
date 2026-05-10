import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PlusIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import Button from '../button';

import { wrapper } from './styles.module.css';

export default function AddStreamButton() {
  const navigate = useNavigate();

  const addStreamMutation = useGraphql(`
mutation {
  addStream {
    app
  }
}
  `);

  const onClick = useCallback(function() {
    addStreamMutation().then(function({ addStream }) {
      navigate(`/streams/${ addStream.app }`);
    });
  }, [ navigate, addStreamMutation ]);

  return (
    <Button onClick={ onClick } className={ wrapper } accent><PlusIcon weight='bold'/> Add Stream</Button>
  );
};
