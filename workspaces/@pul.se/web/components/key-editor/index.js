import { useCallback } from 'react';
import { CopySimpleIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';
import useClipboard from '../../hooks/use-clipboard';

import Input from '../input';

export default function KeyEditor() {
  const { copy } = useClipboard();
  const { stream } = useStream();

  const onClick = useCallback(function() {
    copy(stream.key);
  }, [ stream, copy ]);

  return (
    <Input onClick={ onClick } label='Key' icon={ <CopySimpleIcon /> } value={ stream.key } readonly />
  );
};
