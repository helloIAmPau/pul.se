import { useLayoutEffect, useRef } from 'react';;
import { Hls } from 'hls.js';

import { wrapper } from './styles.module.css';

export default function Video({ url }) {
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
  }, [ ref, url ]);

  return (
    <div className={ wrapper }>
      <video ref={ ref } controls />
    </div>
  );
};
