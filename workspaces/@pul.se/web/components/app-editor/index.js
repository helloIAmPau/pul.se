import { useCallback } from 'react';
import { CopySimpleIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';
import useClipboard from '../../hooks/use-clipboard';

import Input from '../input';

export default function AppEditor() {
  const { copy } = useClipboard();
  const { app } = useStream();

  const onClick = useCallback(function() {
    copy(`rtmp://${ window.location.hostname }/${ app }`);
  }, [ app, copy ]);

  return (
    <Input onClick={ onClick } label='App' icon={ <CopySimpleIcon /> } value={ app } readonly />
  );
};
