import { useCallback } from 'react';

import Section from '../section';
import SectionTitle from '../section-title';
import FormSection from '../form-section';
import FormButton from '../form-button';
import Input from '../input';

import { Form } from '../../contexts/form';

export default function EventEditor() {
  const onSubmit = useCallback(function(values) {
    debugger;
  }, [])

  return (
    <Section>
      <Form>
        <SectionTitle hasBack title='Create Event'>
          <FormButton>Save</FormButton>
        </SectionTitle>
        <FormSection title='Event Information'>
          <Input name='name' label='Event Name' placeholder='Super Event' />
          <Input name='description' label='Description' type='area' placeholder='The best event you ever can attend to...' />
        </FormSection>
        <FormSection title='Time Schedule'>
          <h1>pippolone</h1>
        </FormSection>
      </Form>
    </Section>
  );
};
