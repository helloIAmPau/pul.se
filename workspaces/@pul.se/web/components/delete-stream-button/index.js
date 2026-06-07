import { useCallback } from 'react';
import { SealWarningIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';
import { useNavigate } from 'react-router';

import { useStream } from '../../contexts/stream';

import Button from '../button';

import { button } from './styles.module.css';

export default function DeleteStreamButton() {
  const navigate = useNavigate();
  const { stream } = useStream();

  const deleteStreamMutation = useGraphql(`
mutation($app: UUID!) {
  deleteStream(app: $app) {
    app
  }
}
  `);

  const deleteStream = useCallback(function() {
    return deleteStreamMutation({ app: stream.app });
  }, [ stream, deleteStreamMutation ]);

  const onClick = useCallback(function() {
    deleteStream().then(function() {
      navigate('/dashboard', { replace: true });
    });
  }, [ navigate, deleteStream ]);

  return (
    <Button onClick={ onClick } className={ button }><SealWarningIcon weight='bold' /> Delete</Button>
  );
};
