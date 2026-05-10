import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { ArrowLeftIcon } from '@phosphor-icons/react';

import { StreamProvider } from '../../contexts/stream';

import Heading from '../heading';
import TitleEditor from '../title-editor';
import EndpointEditor from '../endpoint-editor';
import VodTable from '../vod-table';
import Hr from '../hr';
import DeleteStreamButton from '../delete-stream-button';

import { heading, wrapper, section, section_title } from './styles.module.css';

export default function StreamSettings() {
  const navigate = useNavigate();

  const onBack = useCallback(function() {
    navigate('/dashboard');
  }, [ navigate ]);

  return (
    <div className={ wrapper }>
      <Heading className={ heading }>
        <span onClick={ onBack } title='Back'><ArrowLeftIcon /></span>
        Stream
      </Heading>

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
    </div>
  );
};
