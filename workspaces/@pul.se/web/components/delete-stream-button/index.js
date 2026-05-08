import { useCallback } from 'react';
import { SealWarningIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router';

import { useStream } from '../../contexts/stream';

import Button from '../button';

import { button } from './styles.module.css';

export default function DeleteStreamButton() {
  const navigate = useNavigate();
  const { deleteStream } = useStream();

  const onClick = useCallback(function() {
    deleteStream().then(function() {
      navigate('/dashboard', { replace: true });
    });
  }, [ navigate, deleteStream ]);

  return (
    <Button onClick={ onClick } className={ button }><SealWarningIcon weight='bold' /> Delete</Button>
  );
};
