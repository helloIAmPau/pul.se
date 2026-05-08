import { FloppyDiskBackIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';

import TextArea from '../text-area';
import Button from '../button';

import { wrapper, controls } from './styles.module.css';

export default function TitleEditor() {
  const { name, isDirty, setName, updateName } = useStream();

  return (
    <div className={ wrapper }>
      <TextArea value={ name } onChange={ setName } label='Name' />
      <div className={ controls }>
        <Button onClick={ updateName } disabled={ isDirty !== true }><FloppyDiskBackIcon weight='bold' /> Save</Button>
      </div>
    </div>
  )
};
