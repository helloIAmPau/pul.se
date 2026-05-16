import { useLayoutEffect, useState, useMemo } from 'react';
import { useGraphql } from '@pul.se/graphql/client';

import StreamPreview from '../stream-preview';
import Card from '../card';
import Heading from '../heading';
import Carousel from '../carousel';

import { wrapper, dot, heading } from './styles.module.css';

export default function LiveNow() {
  const [ lives, setLives ] = useState([]);

  const livesQuery = useGraphql(`
query {
  lives {
    url,
    app,
    name
  }
}
  `);

  useLayoutEffect(function() {
    livesQuery().then(function({ lives }) {
      setLives(lives);
    });
  }, [ livesQuery ]);

  const previewElements = useMemo(function() {
    return lives.map(function({ url, name, app }) {
      return (
        <StreamPreview key={ url } name={ name } url={ url } app={ app } />
      );
    });
  }, [ lives ]);

  if(lives.length === 0) {
    return;
  }
  
  return (
    <Card className={ wrapper }>
      <Heading className={ heading } secondary><div className={ dot }></div> Live now ({ lives.length } streams)</Heading>
      <Carousel>
        { previewElements }
      </Carousel>
    </Card>
  );
};
