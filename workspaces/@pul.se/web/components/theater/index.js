import Video from '../video';
import VideoHeaders from '../video-headers';
import VideoDescription from '../video-description';

import { StreamProvider } from '../../contexts/stream';

import { theater } from './styles.module.css';

export default function Theater() {
  return (
    <StreamProvider>
      <div className={ theater }>
        <VideoHeaders />
        <Video />
        <VideoDescription />
      </div>
    </StreamProvider>
  );
};
