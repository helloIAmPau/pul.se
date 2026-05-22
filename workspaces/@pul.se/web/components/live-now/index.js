import { useLayoutEffect, useState, useMemo } from 'react';
import { useGraphql } from '@pul.se/graphql/client';
import { useBroadcast } from '@pul.se/broadcast/client';

import StreamPreview from '../stream-preview';
import Card from '../card';
import Heading from '../heading';
import Carousel from '../carousel';

import { wrapper, dot, heading } from './styles.module.css';

export default function LiveNow() {
  const [ lives, setLives ] = useState([]);
  const { socket } = useBroadcast();

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
    if(socket == null) {
      return;
    }

    const update = function() {
      livesQuery().then(function({ lives }) {
        setLives(lives);
      });
    };
    socket.on('events', update);
    update();

    return function() {
      socket.off('events', update);
    };
  }, [ livesQuery, socket ]);

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
