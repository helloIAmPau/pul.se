import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeftIcon } from '@phosphor-icons/react';

import Heading from '../heading';

import { heading } from './styles.module.css';

export default function PaginationHeader({ title, href }) {
  const navigate = useNavigate();

  const onBack = useCallback(function() {
    navigate(href);
  }, [ navigate, href ]);

  return (
    <Heading className={ heading }>
      <span onClick={ onBack } title='Back'><ArrowLeftIcon /></span>
      { title }
    </Heading>
  );
};
