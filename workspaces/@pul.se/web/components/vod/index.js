import { useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router';
import { useGraphql } from '@pul.se/graphql/client';

import Section from '../section';
import PaginationHeader from '../pagination-header';
import Theater from '../theater';

export default function Vod() {
  const [ state, setState ] = useState('LOADING');
  const [ vod, setVod ] = useState();

  const { uid } = useParams();
  const vodQuery = useGraphql(`
query($uid: UUID!) {
  vod(uid: $uid) {
    name
    app
    url
  }
}
  `);

  useLayoutEffect(function() {
    setState('LOADING');

    vodQuery({ uid }).then(function({ vod }) {
      setVod(vod);
      setState('DONE')
    });
  }, [ uid, vodQuery ]);

  if(state === 'LOADING') {
    return;
  }

  return (
    <Section>
      <PaginationHeader title='Vod' href={ `/streams/${ vod.app }` } />
      <Theater name={ vod.name } url={ vod.url } />
    </Section>
  );
};
