import { useLayoutEffect, useMemo, useState, useCallback } from 'react';
import { FloppyDiskBackIcon, EyeClosedIcon, EyeIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import { useStream } from '../../contexts/stream';

import Button from '../button';
import Input from '../input';
import SettingsSection from '../settings-section';
import Columns from '../columns';
import SettingsSectionControlsLayout from '../settings-section-controls-layout';
import SettingsSectionInputsLayout from '../settings-section-inputs-layout';

export default function SettingsEditor() {
  const { stream } = useStream();

  const [ secretType, setSecretType ] = useState('password');
  const [ isDirty, setIsDirty ] = useState(false);
  const [ value, setValue ] = useState(stream.settings);

  useLayoutEffect(function() {
    setIsDirty(false);
    setValue(stream.settings);
  }, [ stream ]);

  const onToggleSecretType = useCallback(function() {
    if(secretType === 'password') {
      setSecretType('text');

      return;
    }

    setSecretType('password')
  }, [ secretType ]);

  const secretIcon = useMemo(function() {
    if(secretType === 'password') {
      return (
        <EyeClosedIcon />
      );
    }

    return (
      <EyeIcon />
    );
  }, [ secretType ]);

  const onChange = useCallback(function({ target }) {
    setIsDirty(true);

    const newValue = {
      ...value,
      storage: {
        ...value.storage
      }
    };

    const keys = target.name.split('.')
    keys.reduce(function(main, key, index) {
      if(index < keys.length - 1) {
        return main[key];
      }

      main[key] = target.value;
    }, newValue);

    setValue(newValue);
  }, [ value ]);

  const updateSettingsMutation = useGraphql(`
mutation($app: UUID!, $settings: JSON!) {
  updateSettings(app: $app, settings: $settings) {
    settings
  }
}
  `);

  const updateSettings = useCallback(function() {
    value.keyframe_interval = parseInt(value.keyframe_interval);

    updateSettingsMutation({
      app: stream.app,
      settings: value
    });
  }, [ value, updateSettingsMutation, stream ]);

  return (
    <SettingsSectionInputsLayout>
      <Input name='storage.host' onChange={ onChange } label='Storage Host' value={ value.storage.host } />
      <Columns>
        <div>
          <Input name='storage.region' onChange={ onChange } label='Region' value={ value.storage.region } />
        </div>
        <div>
          <Input name='storage.bucket' onChange={ onChange } label='Bucket' value={ value.storage.bucket } />
        </div>
      </Columns>
      <Columns>
        <div>
          <Input name='storage.access_key' onChange={ onChange } label='Access Key' value={ value.storage.access_key } />
        </div>
        <div>
          <Input name='storage.access_secret' onChange={ onChange } icon={ secretIcon } onClick={ onToggleSecretType } label='Secret Key' type={ secretType } value={ value.storage.secret_key } />
        </div>
      </Columns>
      <Input name='keyframe_interval' onChange={ onChange } label='Keyframe Interval (seconds)' value={ value.keyframe_interval } type='number' />
      <SettingsSectionControlsLayout>
        <Button onClick={ updateSettings } disabled={ isDirty !== true }><FloppyDiskBackIcon weight='bold' /> Save</Button>
      </SettingsSectionControlsLayout>
    </SettingsSectionInputsLayout>
  );
};
