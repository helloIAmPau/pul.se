import { StreamProvider } from '../../contexts/stream';

import Section from '../section';
import PaginationHeader from '../pagination-header';
import TitleEditor from '../title-editor';
import EndpointEditor from '../endpoint-editor';
import VodTable from '../vod-table';
import DeleteStreamButton from '../delete-stream-button';
import SettingsEditor from '../settings-editor';
import SettingsSection from '../settings-section';

export default function StreamSettings() {
  return (
    <Section>
      <PaginationHeader title='Stream' href='/dashboard' />

      <VodTable />

      <StreamProvider>
        <SettingsSection title='Settings'>
          <TitleEditor />
          <EndpointEditor />
          <SettingsEditor />
        </SettingsSection>

        <SettingsSection title='Danger Zone!'>
          <DeleteStreamButton />
        </SettingsSection>
      </StreamProvider>
    </Section>
  );
};
