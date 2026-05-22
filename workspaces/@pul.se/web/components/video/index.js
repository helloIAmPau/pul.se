import { useRef, useLayoutEffect } from 'react';
import { Hls } from 'hls.js';

import { wrapper, player } from './styles.module.css';

export default function Video({ url, controls, muted }) {
  const ref = useRef();

  useLayoutEffect(function() {
    if(ref.current == null) {
      return;
    }
    const video = ref.current;

    let hls;
    const init = function() {
      hls = new Hls();

      const handleInitialBuffer = function(event, data) {
        if(video.paused === false) {
          return;
        }
      
        const bufferedRanges = video.buffered;
      
        if (bufferedRanges.length <= 0) {
          return;
        }
      
        const bufferedSeconds = bufferedRanges.end(bufferedRanges.length - 1) - video.currentTime;

        if(bufferedSeconds < 2) {
          return;
        }

        hls.off(Hls.Events.FRAG_BUFFERED, handleInitialBuffer);
        video.play().catch(function() {
          video.muted = true;
          return video.play();
        });
      };
      hls.on(Hls.Events.FRAG_BUFFERED, handleInitialBuffer);

      hls.on(Hls.Events.ERROR, function(event, error) {
        if(error.details !== 'manifestParsingError') {
          console.log(error);

          return;
        }

        setTimeout(function() {
          video.pause();
          hls.destroy();
          init();
        }, 200);
      });

      hls.attachMedia(video);
      hls.loadSource(url);
    };
    init();

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
