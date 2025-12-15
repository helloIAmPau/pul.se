import { useCallback, useMemo } from 'react';

import { useGraphql } from '@pul.se/graphql/client';

import Section from '../section';
import SectionTitle from '../section-title';
import FormSection from '../form-section';
import FormButton from '../form-button';
import Input from '../input';

import { Form } from '../../contexts/form';

export default function EventEditor() {
  const [ updateEventMutation ] = useGraphql(`
mutation($event: EventInput!) {
  updateEvent(event: $event)
}
  `);

  const onSubmit = useCallback(function(event) {
    event.price = parseFloat(event.price);

    return updateEventMutation({ event }).then(function({ updateEvent }) {
      debugger;
    }).catch(function(error) {
      debugger;
    });
  }, [ updateEventMutation ]);

  const onValidation = useCallback(function(values) {
    const report = {};

    if(values.name == null || values.name === '') {
      report.name = 'Event name is required';
    }

    if(values.description == null || values.description === '') {
      report.description = 'Description is required';
    }

    if(values.start_timestamp == null || values.start_timestamp === '') {
      report.start_timestamp = 'Start date is required';
    }

    if(values.end_timestamp == null || values.end_timestamp === '') {
      report.end_timestamp = 'End date is required';
    }

    if(values.price == null || values.price === '') {
      report.price = 'Ticker price is required';
    }

    return report;
  }, []);

  const defaults = useMemo(function() {
    return {
      currency: 'EUR'
    };
  }, []);

  const currencies = useMemo(function() {
    return [{
      label: 'Euro',
      value: 'EUR'
    }, {
      label: 'US Dollar',
      value: 'USD'
    }];
  }, []);

  return (
    <Section>
      <Form onSubmit={ onSubmit } onValidation={ onValidation } defaults={ defaults }>
        <SectionTitle hasBack title='Create Event'>
          <FormButton>Save</FormButton>
        </SectionTitle>
        <FormSection title='Event Information'>
          <Input name='name' label='Event Name' placeholder='Super Event' />
          <Input name='description' label='Description' type='area' placeholder='The best event you ever can attend to...' />
        </FormSection>
        <FormSection title='Time Schedule'>
          <Input name='start_timestamp' label='Start Date' type='datetime-local' />
          <Input name='end_timestamp' label='End Date' type='datetime-local' />
        </FormSection>
        <FormSection title='Ticketing'>
          <Input name='price' label='Ticket Price' type='number' placeholder='10.99' />
          <Input name='currency' label='Currency' type='select' options={ currencies } />
        </FormSection>
      </Form>
    </Section>
  );
};
