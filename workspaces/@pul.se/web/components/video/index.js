import { useLayoutEffect, useRef } from 'react';;
import { useStream } from '../../contexts/stream';

import { Hls } from 'hls.js';

import { wrapper, video } from './styles.module.css';

export default function Video({ url }) {
  const ref = useRef();
  const { source } = useStream();

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

    hls.loadSource(source);
    hls.attachMedia(video);

    return function() {
      hls.destroy();
    };
  }, [ ref, source ]);

  return (
    <div className={ wrapper }>
      <video ref={ ref } className={ video } controls />
    </div>
  );
};
