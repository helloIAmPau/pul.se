import { useRef, useLayoutEffect } from 'react';
import { Hls } from 'hls.js';

import { useStream } from '../../contexts/stream';

import { wrapper, player } from './styles.module.css';

export default function Video({ url, controls, muted }) {
  const ref = useRef();

  useLayoutEffect(function() {
    if(ref.current == null) {
      return;
    }

    const video = ref.current;
    const hls = new Hls();

    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      video.play().catch(function() {
        video.muted = true;
        video.play();
      });
    });

    hls.loadSource(url);
    hls.attachMedia(video);

    return function() {
      hls.destroy();
    };
  }, [ ref, url ]);

  return (
    <div className={ wrapper }>
      <video ref={ ref } muted={ muted } className={ player } controls={ controls } />
    </div>
  );
};
