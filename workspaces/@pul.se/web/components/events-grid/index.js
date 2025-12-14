import { useMemo, useCallback } from 'react';
import { useGraphql } from '@pul.se/graphql/client';

import Section from '../section';
import Button from '../button';
import Grid from '../grid';
import SectionTitle from '../section-title';

export default function EventsGrid() {
  const [ eventsQuery ] = useGraphql(`
query {
  events {
    uid
    name
    description
    start_timestamp
    end_timestamp
  }
}
  `);

  const columns = useMemo(function() {
    return [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'description',
      label: 'Description'
    }, {
      key: 'start_timestamp',
      label: 'Start Time'
    }, {
      key: 'end_timestamp',
      label: 'End Time'
    }];
  }, []);

  const onData = useCallback(function() {
    return eventsQuery().then(function({ events }) {
      return events;
    });
  }, [ eventsQuery ]);

  return (
    <Section>
      <SectionTitle title='Events'>
        <Button secondary>Create Event</Button>
      </SectionTitle>
      <Grid onData={ onData } columns={ columns } />
    </Section>
  );
};
