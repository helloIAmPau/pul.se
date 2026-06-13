import { useCallback } from 'react';
import { CopySimpleIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';
import useClipboard from '../../hooks/use-clipboard';

import Input from '../input';

export default function AppEditor() {
  const { copy } = useClipboard();
  const { stream } = useStream();

  const onClick = useCallback(function() {
    copy(`rtmp://${ window.location.hostname }/${ stream.app }`);
  }, [ stream, copy ]);

  return (
    <Input onClick={ onClick } label='App' icon={ <CopySimpleIcon /> } value={ stream.app } readonly />
  );
};
