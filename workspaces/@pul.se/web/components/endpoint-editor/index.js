import { useCallback } from 'react';
import { ArrowsCounterClockwiseIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import { useStream } from '../../contexts/stream';

import AppEditor from '../app-editor';
import KeyEditor from '../key-editor';
import Button from '../button';

import { columns, column, wrapper, controls, section } from './styles.module.css';

export default function EndopointEditor() {
  const { regenerateKey } = useStream();

  return (
    <div className={ wrapper }>
      <div className={ columns }>
        <div className={ column }>
          <AppEditor />
        </div>
        <div className={ column }>
          <KeyEditor />
        </div>
      </div>
      <div className={ controls }>
        <Button onClick={ regenerateKey } accent><ArrowsCounterClockwiseIcon weight='bold' /> Regenerate Key</Button>
      </div>
    </div>
  );
};
