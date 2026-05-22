import { useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';
import { useBroadcast } from '@pul.se/broadcast/client';

import Heading from '../heading';
import Section from '../section';
import PaginationHeader from '../pagination-header';
import Theater from '../theater';

export default function Live() {
  const [ live, setLive ] = useState();
  const { socket } = useBroadcast();

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
    if(socket == null) {
      return;
    }

    const update = function() {
      liveQuery({ app }).then(function({ live }) {
        setLive(live);
      });
    };
    socket.on('events', function(event) {
      if(event.app !== app) {
        return;
      }

      update();
    });
    update();

    return function() {
      socket.off('events', update);
    };
  }, [ socket, liveQuery, app ]);

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
