import Video from '../video';
import VideoHeaders from '../video-headers';

import { theater } from './styles.module.css';

export default function Theater() {
  return (
    <div className={ theater }>
      <Video url='/streams/playlist.m3u8' />
      <VideoHeaders />
    </div>
  );
};
