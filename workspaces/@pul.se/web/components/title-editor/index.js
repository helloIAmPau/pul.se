import { useLayoutEffect, useCallback, useState } from 'react';
import { useGraphql } from '@pul.se/graphql/client';
import { FloppyDiskBackIcon } from '@phosphor-icons/react';

import { useStream } from '../../contexts/stream';

import TextArea from '../text-area';
import Button from '../button';
import SettingsSectionControlsLayout from '../settings-section-controls-layout';
import SettingsSectionInputsLayout from '../settings-section-inputs-layout';

export default function TitleEditor() {
  const { stream } = useStream();
  const [ value, setValue ] = useState(stream.name);
  const [ isDirty, setIsDirty ] = useState(false);

  useLayoutEffect(function(name) {
    setIsDirty(false);
    setValue(stream.name);
  }, [ stream ]);

  const setName = useCallback(function(name) {
    setIsDirty(true);
    setValue(name);
  }, []);

  const updateNameMutation = useGraphql(`
mutation($app: UUID!, $name: String!) {
  updateName(npp: $app, ame: $name) {
    name
  }
}
  `);

  const updateName = useCallback(function() {
    updateNameMutation({
      app: stream.app,
      name: value
    });
  }, [ value, updateNameMutation, stream ]);

  return (
    <SettingsSectionInputsLayout>
      <TextArea value={ value } onChange={ setName } label='Title' />
      <SettingsSectionControlsLayout>
        <Button onClick={ updateName } disabled={ isDirty !== true }><FloppyDiskBackIcon weight='bold' /> Save</Button>
      </SettingsSectionControlsLayout>
    </SettingsSectionInputsLayout>
  )
};
