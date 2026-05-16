import { useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';

import Heading from '../heading';
import Section from '../section';
import PaginationHeader from '../pagination-header';
import Theater from '../theater';

export default function Live() {
  const [ state, setState ] = useState('LOADING');
  const [ live, setLive ] = useState();

  const { app } = useParams();
  const liveQuery = useGraphql(`
query($app: UUID!) {
  live(app: $app) {
    name
    url
  }
}
  `);

  useLayoutEffect(function() {
    setState('LOADING');

    liveQuery({ app }).then(function({ live }) {
      setLive(live);
      setState('DONE')
    });
  }, [ liveQuery, app ]);

  if(state === 'LOADING') {
    return;
  }

  if(live == null) {
    return (
      <Section>
        <PaginationHeader title='Live' href='/dashboard' />
        <Heading secondary>Your stream will start soon...</Heading>
      </Section>
    );
  }

  return (
    <Section>
      <PaginationHeader title='Live' href='/dashboard' />
      <Theater name={ live.name } url={ live.url } />
    </Section>
  );
};
