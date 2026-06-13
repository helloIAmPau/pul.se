import { useCallback } from 'react';
import { ArrowsCounterClockwiseIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import { useStream } from '../../contexts/stream';

import AppEditor from '../app-editor';
import KeyEditor from '../key-editor';
import Button from '../button';
import Columns from '../columns';
import SettingsSectionInputsLayout from '../settings-section-inputs-layout';
import SettingsSectionControlsLayout from '../settings-section-controls-layout';

export default function EndopointEditor() {
  const { stream } = useStream();

  const regenerateKeyMutation = useGraphql(`
mutation($app: UUID!) {
  regenerateKey(app: $app) {
    key
  }
}
  `);

  const regenerateKey = useCallback(function() {
    regenerateKeyMutation({ app: stream.app });
  }, [ regenerateKeyMutation, stream ]);

  return (
    <SettingsSectionInputsLayout>
      <Columns>
        <div>
          <AppEditor />
        </div>
        <div>
          <KeyEditor />
        </div>
      </Columns>
      <SettingsSectionControlsLayout>
        <Button onClick={ regenerateKey } accent><ArrowsCounterClockwiseIcon weight='bold' /> Regenerate Key</Button>
      </SettingsSectionControlsLayout>
    </SettingsSectionInputsLayout>
  );
};
