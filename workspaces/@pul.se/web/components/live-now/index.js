import { useLayoutEffect, useState, useMemo } from 'react';
import { useGraphql } from '@pul.se/graphql/client';

import StreamPreview from '../stream-preview';
import Card from '../card';
import Heading from '../heading';
import Carousel from '../carousel';

import { wrapper, dot, heading } from './styles.module.css';

export default function LiveNow() {
  const [ live, setLive ] = useState([]);

  const liveQuery = useGraphql(`
query {
  live {
    url,
    app,
    name
  }
}
  `);

  useLayoutEffect(function() {
    liveQuery().then(function({ live }) {
      setLive(live);
    });
  }, [ liveQuery ]);

  const previewElements = useMemo(function() {
    return live.map(function({ url, name, app }) {
      return (
        <StreamPreview key={ url } name={ name } url={ url } app={ app } />
      );
    });
  }, [ live ]);

  if(live.length === 0) {
    return;
  }
  
  return (
    <Card className={ wrapper }>
      <Heading className={ heading } secondary><div className={ dot }></div> Live now ({ live.length } streams)</Heading>
      <Carousel>
        { previewElements }
      </Carousel>
    </Card>
  );
};
