import { StreamProvider } from '../../contexts/stream';

import Section from '../section';
import PaginationHeader from '../pagination-header';
import Heading from '../heading';
import TitleEditor from '../title-editor';
import EndpointEditor from '../endpoint-editor';
import VodTable from '../vod-table';
import Hr from '../hr';
import DeleteStreamButton from '../delete-stream-button';

import { section, section_title } from './styles.module.css';

export default function StreamSettings() {
  return (
    <Section>
      <PaginationHeader title='Stream' href='/dashboard' />

      <VodTable />

      <StreamProvider>
        <div className={ section }>
          <div className={ section_title }>
            <Heading secondary>Settings</Heading>
            <Hr />
          </div>
          <TitleEditor />
          <EndpointEditor />
        </div>

        <div className={ section }>
          <div className={ section_title }>
            <Heading secondary>Danger Zone!</Heading>
            <Hr />
          </div>
          <DeleteStreamButton />
        </div>
      </StreamProvider>
    </Section>
  );
};
