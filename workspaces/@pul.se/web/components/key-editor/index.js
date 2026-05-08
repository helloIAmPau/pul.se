import { useCallback } from 'react';
import { CopySimpleIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';
import useClipboard from '../../hooks/use-clipboard';

import Input from '../input';

export default function KeyEditor() {
  const { copy } = useClipboard();
  const { key } = useStream();

  const onClick = useCallback(function() {
    copy(key);
  }, [ key, copy ]);

  return (
    <Input onClick={ onClick } label='Key' icon={ <CopySimpleIcon /> } value={ key } readonly />
  );
};
